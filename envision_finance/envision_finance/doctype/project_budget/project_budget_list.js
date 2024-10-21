frappe.listview_settings["Project Budget"] = {
    refresh: function(listview) {
        listview.page.add_inner_button(__("Project Budget V/s Actual"), function() {
            frappe.set_route('query-report', 'Budget vs Actual');
        }, __("Report"));
        listview.page.add_inner_button(__("Quarter wise Budget V/s Actual"), function() {
            frappe.set_route('query-report', 'Quarter wise Budget vs Actual');
        }, __("Report"));
        listview.page.add_inner_button(__("Project wise Margin Report"), function() {
            frappe.set_route('query-report', 'Project wise Margin');
        }, __("Report"));
    }
};