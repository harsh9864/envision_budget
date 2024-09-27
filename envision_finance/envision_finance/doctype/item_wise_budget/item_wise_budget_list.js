frappe.listview_settings["Item wise Budget"] = {
    refresh: function(listview) {
        listview.page.add_inner_button(__("Item wise Budget V/s Actual"), function() {
            frappe.set_route('query-report', 'Budget vs Actual');
        }, __("Report"));
        listview.page.add_inner_button(__("Quarter wise Budget V/s Actual"), function() {
            frappe.set_route('query-report', 'Quarter wise Budget vs Actual');
        }, __("Report"));
        listview.page.add_inner_button(__("Vendor wise Budget V/s Actual"), function() {
            frappe.set_route('query-report', 'Vendor wise Budget vs Actual');
        }, __("Report"));
        listview.page.add_inner_button(__("Project wise Margin Report"), function() {
            frappe.set_route('query-report', 'Project wise Margin');
        }, __("Report"));
    }
};