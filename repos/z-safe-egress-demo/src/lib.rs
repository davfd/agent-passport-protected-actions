#![warn(clippy::style, missing_debug_implementations)]
#![cfg_attr(not(target_arch = "wasm32"), allow(dead_code))]

extern crate alloc;

#[cfg(target_arch = "wasm32")]
use alloc::{format, string::String, vec, vec::Vec};

#[cfg(target_arch = "wasm32")]
use serde::{Deserialize, Serialize};

pub const CONTRACT_VERSION: &str = "0.1.0";

wit_bindgen::generate!({
    world: "safe-egress-demo",
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
struct SafeEgressInput {
    #[serde(rename = "requestId")]
    request_id: String,
    url: String,
    #[serde(default = "default_action")]
    action: String,
    #[serde(default = "default_target")]
    target: String,
}

#[cfg(target_arch = "wasm32")]
#[derive(Debug, Serialize)]
struct SafeEgressOutput {
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
    #[serde(rename = "httpStatus")]
    http_status: u16,
    #[serde(rename = "responseBytes")]
    response_bytes: usize,
    #[serde(rename = "rawPiiReturned")]
    raw_pii_returned: bool,
    #[serde(rename = "moneyMovement")]
    money_movement: bool,
    #[serde(rename = "placeholderMode")]
    placeholder_mode: String,
}

#[cfg(target_arch = "wasm32")]
impl exports::z::safe_egress_demo::contracts::Guest for Component {
    fn ping_allowed(
        req: exports::z::safe_egress_demo::contracts::GenericInput,
    ) -> Result<Vec<u8>, String> {
        let input = req.input.ok_or("ping-allowed: missing input")?;
        let parsed: SafeEgressInput = serde_json::from_slice(&input).map_err(|e| e.to_string())?;
        run_ping(parsed, false)
    }

    fn ping_placeholder_denial(
        req: exports::z::safe_egress_demo::contracts::GenericInput,
    ) -> Result<Vec<u8>, String> {
        let input = req.input.ok_or("ping-placeholder-denial: missing input")?;
        let parsed: SafeEgressInput = serde_json::from_slice(&input).map_err(|e| e.to_string())?;
        run_ping(parsed, true)
    }
}

#[cfg(target_arch = "wasm32")]
fn run_ping(parsed: SafeEgressInput, include_placeholder: bool) -> Result<Vec<u8>, String> {
    use crate::host::{
        interfaces::{http_with_placeholders as hwp, logging},
        tenant::tenant_context,
    };
    use serde_json::json;

    if parsed.request_id.is_empty() {
        return Err("requestId is required".into());
    }
    if !(parsed.url.starts_with("https://") || parsed.url.starts_with("http://")) {
        return Err("url must start with http:// or https://".into());
    }

    let seq_no = tenant_context::seq_no();
    let contract_id = tenant_context::contract_id();
    let placeholder_mode = if include_placeholder { "intentional-denial" } else { "none" };

    let body = if include_placeholder {
        json!({
            "requestId": parsed.request_id,
            "probe": "leonardo-safe-egress-demo",
            "placeholderMode": placeholder_mode,
            "pii": false,
            "rawPiiReturned": false,
            "syntheticMarker": "{{profile.__leonardo_forbidden_demo_field}}"
        })
    } else {
        json!({
            "requestId": parsed.request_id,
            "probe": "leonardo-safe-egress-demo",
            "placeholderMode": placeholder_mode,
            "pii": false,
            "rawPiiReturned": false,
            "syntheticMarker": "static-non-pii-demo-token"
        })
    };

    logging::info(&format!(
        "safe-egress request={} mode={} seq={}",
        parsed.request_id, placeholder_mode, seq_no
    ))
    .map_err(|e| format!("logging.info: {e}"))?;

    let resp = hwp::call(&hwp::Request {
        method: hwp::Verb::Post,
        url: parsed.url.clone(),
        headers: Some(vec![
            ("Accept".into(), "application/json".into()),
            ("Content-Type".into(), "application/json".into()),
        ]),
        payload: Some(serde_json::to_vec(&body).map_err(|e| e.to_string())?),
    })
    .map_err(|e| format!("safe-egress http-with-placeholders: {}", format_http_error(e)))?;

    if include_placeholder {
        return Err("placeholder denial did not occur; refusing to treat this as a safe proof".into());
    }

    let detail = json!({
        "requestId": parsed.request_id,
        "probe": "safe-egress-allowed",
        "httpStatus": resp.code,
        "responseBytes": resp.payload.len(),
        "tenantSeqNo": seq_no,
        "contractId": contract_id,
        "rawPiiReturned": false,
        "moneyMovement": false,
        "placeholderMode": placeholder_mode
    })
    .to_string();

    #[cfg(feature = "emit-audit")]
    logging::audit(&logging::AuditEvent {
        action: parsed.action.clone(),
        target: parsed.target.clone(),
        outcome: "success".into(),
        details: Some(detail),
    })
    .map_err(|e| format!("logging.audit: {e}"))?;

    let output = SafeEgressOutput {
        ok: true,
        request_id: parsed.request_id,
        action: parsed.action,
        target: parsed.target,
        outcome: "success".into(),
        tenant_seq_no: seq_no,
        contract_id,
        http_status: resp.code,
        response_bytes: resp.payload.len(),
        raw_pii_returned: false,
        money_movement: false,
        placeholder_mode: placeholder_mode.into(),
    };

    serde_json::to_vec(&output).map_err(|e| e.to_string())
}

#[cfg(target_arch = "wasm32")]
fn format_http_error(e: host::interfaces::http_with_placeholders::HttpError) -> String {
    use crate::host::interfaces::http_with_placeholders as hwp;
    match e {
        hwp::HttpError::EgressDenied(host) => format!("egress denied for host {host}"),
        hwp::HttpError::PlaceholderDenied(marker) => format!("placeholder not permitted: {marker}"),
        hwp::HttpError::PlaceholderUnknown(field) => format!("user profile missing field: {field}"),
        hwp::HttpError::PlaceholderNoUserContext => "no user context bound for placeholder resolution".into(),
        hwp::HttpError::UpstreamError(reason) => format!("upstream: {reason}"),
    }
}

#[cfg(target_arch = "wasm32")]
fn default_action() -> String {
    "agent-passport.safe-egress".into()
}

#[cfg(target_arch = "wasm32")]
fn default_target() -> String {
    "terminal3.testnet.safe-egress".into()
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

    #[test]
    fn contract_version_is_v0_1_0() {
        assert_eq!(CONTRACT_VERSION, "0.1.0");
    }
}
