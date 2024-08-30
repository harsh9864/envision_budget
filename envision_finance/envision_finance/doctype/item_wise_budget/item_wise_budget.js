frappe.ui.form.on("Item wise Budget", {

    quotation: function(frm) {
        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Quotation",
                name: frm.doc.quotation
            },
            callback:function(response){
                let row = response.message.items
                frm.clear_table("budgeted_items");
                row.forEach(data => {
                    let row = frm.add_child('budgeted_items',{
                        item:data.item_code,
                        quantity:data.qty,
                        unit_price:data.rate,
                        amount:data.amount,
                        current_budget:data.amount,
                        hsn_sac_code:data.gst_hsn_code,
                        item_group:data.item_group,
                        uom:data.uom
                    })
                    frm.refresh_field("budgeted_items")
                })

            }
        });
    },
    before_save: function (frm) {
        if(frm.doc.applicable_on_purchase_order == 0 && frm.doc.applicable_on_purchase_invoice == 0){
            frappe.throw("Please select at least one of the Control Action/s");
        }
        else{
            frm.set_value("is_used",1)
        }
    },
});

frappe.ui.form.on("Budget Items",{

    apply_budget_on:function(frm,cdt,cdn){
        var row = locals[cdt][cdn];
        if (row.apply_budget_on == "Item Group") {
            frappe.model.set_value(cdt, cdn, 'hsn__sac_code', null);
            frappe.model.set_value(cdt, cdn, 'quantity', 0.00);
            frappe.model.set_value(cdt, cdn, 'remaining_quantity', 0.00);
            frappe.model.set_value(cdt, cdn, 'unit_price', 0.00); 
        }
    },
    quantity:function(frm,cdt,cdn){
        var row = locals[cdt][cdn];
        var amount = row.quantity * row.unit_price;
        frappe.model.set_value(cdt, cdn, 'remaining_quantity', row.quantity);
        if(amount == NaN){
            frappe.model.set_value(cdt, cdn, 'amount', 0);
        }
        else{
            frappe.model.set_value(cdt, cdn, 'amount', amount);
        }
    },

    unit_price:function(frm,cdt,cdn){
        var row = locals[cdt][cdn];
        var amount = row.quantity * row.unit_price;
        if(amount == NaN){
            frappe.model.set_value(cdt, cdn, 'amount', 0);
        }
        else{
            frappe.model.set_value(cdt, cdn, 'amount', amount);
        }

    },
    amount:function(frm,cdt,cdn){
        var row = locals[cdt][cdn];
        frappe.model.set_value(cdt, cdn, 'current_budget', row.amount);
    },

    item: function(frm, cdt, cdn) {
        var row = locals[cdt][cdn];
        console.log(row.apply_budget_on)
        if (frm.doc.project != null && frm.doc.department != null && row.item != null) {
            if (row.apply_budget_on == "Item") {
                frappe.call({
                    method: "envision_finance.envision_finance.doctype.item_wise_budget.item_wise_budget.verifying_the_budgeted_items",
                    args: {
                        project: frm.doc.project,
                        department: frm.doc.department,
                        item: row.item,
                        applicable_on_purchase_order: frm.doc.applicable_on_purchase_order,
                        applicable_on_purchase_invoice: frm.doc.applicable_on_purchase_invoice,
                        fiscal_year: frm.doc.fiscal_year
                    },
                    callback: function(response) {
                        if (response.data == null) {
                            console.log(1)
                        }
                        else{
                            frappe.throw(`<b>Item Already exists in another Budget</b><br><br><b>${row.item}</b> already exists in Budget: <b>${response.data[0].name}</b>`);
                        }
                    }
                });
            }
        } else if (frm.doc.project == null) {
            cur_frm.clear_table("budgeted_items");
            cur_frm.refresh_field("budgeted_items");
            frappe.msgprint("Please specify the Project");
            cur_frm.refresh();
        } else if (frm.doc.department == null) {
            cur_frm.clear_table("budgeted_items");
            cur_frm.refresh_field("budgeted_items");
            frappe.msgprint("Please specify the Department");
            cur_frm.refresh();
        }

        if (row.apply_budget_on == "Item") {
            frappe.call({
                method: "envision_finance.envision_finance.doctype.item_wise_budget.item_wise_budget.get_item_details",
                args: {
                    item_code: row.item
                },
                callback: function(response) {
                    let item_details = response.message;
                    frappe.model.set_value(cdt, cdn, 'uom', item_details.stock_uom);
                    frappe.model.set_value(cdt, cdn, 'hsn__sac_code', item_details.gst_hsn_code);
                    frappe.model.set_value(cdt, cdn, 'item_group', item_details.item_group);
                }
            });
        }
    }
})