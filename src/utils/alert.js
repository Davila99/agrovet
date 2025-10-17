export async function showSweetAlert(title, text, icon = "error") {
  try {
    const Swal = (await import("sweetalert2")).default;
    await Swal.fire({ title, text, icon });
  } catch (e) {
    try { window.alert(`${title} - ${text}`); } catch (err) { console.warn("Alert fallback failed", err); }
  }
}

export default showSweetAlert;
