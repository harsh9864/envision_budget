// Copyright (c) 2024, Dhruvil Mistry and contributors
// For license information, please see license.txt

frappe.query_reports["Budget vs Actual"] = {
	"filters": [
		{
			"fieldname": "company",
			"label": __("Company"),
			"fieldtype": "Link",
			"options": "Company",
			"default": frappe.defaults.get_user_default("Company"),
		},
		{
			"fieldname": "fiscal_year",
			"label": __("Fiscal Year"),
			"fieldtype": "Link",
			"options": "Fiscal Year",
			"default": erpnext.utils.get_fiscal_year(frappe.datetime.get_today()),
		},		
		{
			"fieldname": "from_date",
			"label": __("From Date"),
			"fieldtype": "Date",
			"default": frappe.datetime.add_months(frappe.datetime.get_today(), -1),
		},
		{
			"fieldname": "to_date",
			"label": __("To Date"),
			"fieldtype": "Date",
			"default": frappe.datetime.get_today(),
		},
		{
			"fieldname": "voucher_type",
			"label": __("Voucher Type"),
			"fieldtype": "Select",
			"options": ["Project","Department","Supplier", "Customer"],
			"default": "Project",
		},
		{
			"fieldname": "id",
			"label": __("ID"),
			"fieldtype": "Link",
			"options": "Project",  // Default to Project, dynamically changed later
		},
	],

	onload: function(report) {
        var voucher_type_filter = frappe.query_report.get_filter("voucher_type");
        var id_filter = frappe.query_report.get_filter("id");

        // Set default value for voucher_type filter when the report loads
        voucher_type_filter.set_value("Project");

        // Add an event listener for changes to the voucher_type filter
        voucher_type_filter.$input.on("change", function() {
            var voucher_type = voucher_type_filter.get_value();
            
            // Update the options of the id filter based on the selected voucher_type
            if (id_filter) {
                // Update the filter options based on voucher_type
                if (voucher_type === "Project") {
                    id_filter.df.options = "Project";
                } else if (voucher_type === "Supplier") {
                    id_filter.df.options = "Supplier";
                } else if (voucher_type === "Customer") {
                    id_filter.df.options = "Customer";
                } else if (voucher_type === "Department") {
                    id_filter.df.options = "Department";
                }else {
                    id_filter.df.options = "";  // Clear options if no match
                }
                id_filter.refresh();  // Refresh the filter to apply the changes
            }

            // Refresh the report to reflect the changes
            frappe.query_report.refresh();
        });
    },
};
