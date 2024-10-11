frappe.ui.form.on("Sales Invoice", {
    refresh: function(frm) {
        frm.set_query("project", function() {
            if (frm.doc.company) {
                return {
                    filters: {
                        "company": frm.doc.company // Filter based on the selected company
                    }
                };
            } else {
                // Return all projects if no company is selected
                return {};
            }
        });
    }
});
