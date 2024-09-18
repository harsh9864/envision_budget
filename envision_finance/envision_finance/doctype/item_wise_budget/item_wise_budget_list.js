frappe.listview_settings["Item wise Budget"] = {
    refresh: function(listview) {
        listview.page.add_inner_button(__("Budget V/s Actual"), function() {
            frappe.set_route('query-report', 'Budget vs Actual');
        }, __("Report"));
    }
};