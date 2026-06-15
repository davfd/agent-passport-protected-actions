#![warn(clippy::style, missing_debug_implementations)]
#![cfg_attr(not(target_arch = "wasm32"), allow(dead_code))]

extern crate alloc;

#[cfg(target_arch = "wasm32")]
use alloc::{format, string::String, vec::Vec};

#[cfg(target_arch = "wasm32")]
use serde::{Deserialize, Serialize};

pub const CONTRACT_VERSION: &str = "0.1.0";

wit_bindgen::generate!({
    world: "audit-probe",
    path: "wit",
    additional_derives: [
        serde::Deserialize,
        serde::Serialize,
    ],
    generate_all,
});

struct Component;

#[cfg(target_arch = "wasm32")]
#[derive(Debug, Deserialize)]
struct AuditProbeInput {
    #[serde(rename = "requestId")]
    request_id: String,
    #[serde(default = "default_action")]
    action: String,
    #[serde(default = "default_target")]
    target: String,
    #[serde(rename = "subjectHash")]
    subject_hash: Option<String>,
    #[serde(rename = "anchorKind")]
    anchor_kind: Option<String>,
}

#[cfg(target_arch = "wasm32")]
#[derive(Debug, Serialize)]
struct AuditProbeOutput {
    ok: bool,
    #[serde(rename = "requestId")]
    request_id: String,
    action: String,
    target: String,
    outcome: String,
    #[serde(rename = "tenantSeqNo")]
    tenant_seq_no: u64,
    #[serde(rename = "contractId")]
    contract_id: u32,
    #[serde(rename = "amountCents")]
    amount_cents: u32,
    pii: bool,
    #[serde(rename = "subjectHash")]
    subject_hash: Option<String>,
    #[serde(rename = "anchorKind")]
    anchor_kind: Option<String>,
}

#[cfg(target_arch = "wasm32")]
impl exports::z::audit_probe::contracts::Guest for Component {
    fn audit_ping(
        req: exports::z::audit_probe::contracts::GenericInput,
    ) -> Result<Vec<u8>, String> {
        let input = req.input.ok_or("audit-ping: missing input")?;
        let parsed: AuditProbeInput = serde_json::from_slice(&input).map_err(|e| e.to_string())?;

        if parsed.request_id.is_empty() {
            return Err("requestId is required".into());
        }

        let seq_no = host::tenant::tenant_context::seq_no();
        let contract_id = host::tenant::tenant_context::contract_id();
        let detail = serde_json::json!({
            "requestId": parsed.request_id,
            "amountCents": 0,
            "pii": false,
            "contractId": contract_id,
            "tenantSeqNo": seq_no,
            "probe": "agent-passport-live-audit-gate",
            "subjectHash": parsed.subject_hash,
            "anchorKind": parsed.anchor_kind
        })
        .to_string();

        host::interfaces::logging::info(&format!(
            "agent-passport audit probe request={} seq={}",
            parsed.request_id, seq_no
        ))
        .map_err(|e| format!("logging.info: {e}"))?;

        #[cfg(feature = "emit-audit")]
        host::interfaces::logging::audit(&host::interfaces::logging::AuditEvent {
            action: parsed.action.clone(),
            target: parsed.target.clone(),
            outcome: "success".into(),
            details: Some(detail.clone()),
        })
        .map_err(|e| format!("logging.audit: {e}"))?;

        #[cfg(not(feature = "emit-audit"))]
        let _ = detail;

        let output = AuditProbeOutput {
            ok: true,
            request_id: parsed.request_id,
            action: parsed.action,
            target: parsed.target,
            outcome: "success".into(),
            tenant_seq_no: seq_no,
            contract_id,
            amount_cents: 0,
            pii: false,
            subject_hash: parsed.subject_hash,
            anchor_kind: parsed.anchor_kind,
        };
        serde_json::to_vec(&output).map_err(|e| e.to_string())
    }
}

#[cfg(target_arch = "wasm32")]
fn default_action() -> String {
    "agent-passport.audit-probe".into()
}

#[cfg(target_arch = "wasm32")]
fn default_target() -> String {
    "terminal3.testnet.audit-probe".into()
}

#[cfg(target_arch = "wasm32")]
export!(Component);

#[cfg(test)]
mod tests {
    use super::CONTRACT_VERSION;

    #[test]
    fn contract_version_is_semver() {
        let parts: Vec<&str> = CONTRACT_VERSION.split('.').collect();
        assert_eq!(parts.len(), 3);
        for part in parts {
            assert!(part.parse::<u32>().is_ok());
        }
    }
}
