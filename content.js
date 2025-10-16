browser.runtime.onMessage.addListener((msg) => {
  if (msg.action === "autofill") {
    browser.storage.sync.get("userData").then(({ userData }) => {
      if (!userData) return;

      const mappings = {
        firstname: ["main name", "firstname", "first_name", "first-name"],
        lastname: ["surname", "lastname", "last_name", "last-name"],
        fullname: ["full name", "fullname"],
        email: ["email", "user_email", "mail", "e-mail"],
        phone: ["phone", "mobile", "tel", "telephone"],
        city: ["city", "town"],
        country: ["country"],
        zip: ["zip", "postal", "postal code", "postcode"],
        gender: ["gender", "sex"],
      };

      // Normalize mapping variants to lowercase for reliable comparisons
      for (const k of Object.keys(mappings)) {
        mappings[k] = mappings[k].map((v) => v.toLowerCase());
      }

      // Select inputs, textareas and selects; skip hidden/password/disabled
      const elements = Array.from(
        document.querySelectorAll("input, textarea, select")
      );

      elements.forEach((el) => {
        if (el.disabled) return;
        const tag = el.tagName.toLowerCase();
        const type = (el.type || "").toLowerCase();
        if (type === "hidden" || type === "password") return;

        const fieldName = (el.name || "").toLowerCase();
        const fieldId = (el.id || "").toLowerCase();

        const labelEl =
          (el.id && document.querySelector(`label[for="${el.id}"]`)) ||
          el.closest("label");
        const labelText = (labelEl?.innerText || "").toLowerCase();

        for (const [key, variants] of Object.entries(mappings)) {
          const match = variants.some((v) =>
            fieldName.includes(v) || fieldId.includes(v) || labelText.includes(v)
          );
          if (!match) continue;

          const value = userData[key];
          if (value == null) continue; // skip undefined/null

          // Handle radio buttons: check radio with matching value
          if (type === "radio") {
            if (String(el.value).toLowerCase() === String(value).toLowerCase()) {
              el.checked = true;
            }
            continue;
          }

          // Handle checkboxes (expect boolean or matching value)
          if (type === "checkbox") {
            if (typeof value === "boolean") {
              el.checked = value;
            } else if (String(el.value).toLowerCase() === String(value).toLowerCase()) {
              el.checked = true;
            }
            continue;
          }

          // Select element: set value if option exists
          if (tag === "select") {
            const opt = Array.from(el.options).find(
              (o) => o.value === value || o.text === value
            );
            if (opt) el.value = opt.value;
            continue;
          }

          // Text-like fields (input/textarea)
          const current = String(el.value || "").trim();
          if (current === "") {
            el.value = String(value);
          }
        }
      });
    });
  }
});
