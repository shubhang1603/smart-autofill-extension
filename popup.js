// Load saved data
browser.storage.sync.get("userData").then((result) => {
  if (result.userData) {
    for (const [key, value] of Object.entries(result.userData)) {
      const el = document.getElementById(key);
      if (el) el.value = value;
    }
  }
});

// Save data
document.getElementById("save").addEventListener("click", () => {
  const firstname = document.getElementById("firstname").value.trim();
  const lastname = document.getElementById("lastname").value.trim();

  const data = {
    firstname: firstname,
    lastname: lastname,
    fullname: (firstname + " " + lastname).trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    city: document.getElementById("city").value.trim(),
    country: document.getElementById("country").value.trim(),
    zip: document.getElementById("zip").value.trim(),
    gender: document.getElementById("gender").value
  };

  browser.storage.sync.set({ userData: data })
    .then(() => alert("Data saved!"))
    .catch((err) => console.error("Failed to save userData:", err));
});

// Trigger autofill in the current tab
document.getElementById("fill").addEventListener("click", async () => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const tab = tabs && tabs[0];
  if (tab && tab.id) {
    browser.tabs.sendMessage(tab.id, { action: "autofill" });
  } else {
    console.error("No active tab found to send autofill message.");
  }
});
