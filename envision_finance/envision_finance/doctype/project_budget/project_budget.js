frappe.ui.form.on("Project Budget", {

onload: function(frm){
    frm.set_query("project", function() {
        return {
            filters: {
                "company": frm.doc.company
            }
        };
    });
    frm.set_query("quotation", function() {
        return {
            filters: {
                "company": frm.doc.company
            }
        };
    });
    frm.set_query("department", function() {
        return {
            filters: {
                "company": frm.doc.company
            }
        };
    });
    frm.set_value("fiscal_year", erpnext.utils.get_fiscal_year(frappe.datetime.get_today()))
},

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

project: function (frm) {
    frappe.db.get_list('Project', {
        filters: {
            'name': frm.doc.project
        },
        fields: ['department']
    }).then(result => {
        if (result.length > 0) {
            const department = result[0].department;
            frm.set_value('department', department);
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

    let budgeted_items_data = frm.doc.budgeted_items;
    let stable_items_count = fluctuating_items_count = stable_items_budgeted_amount = fluctuating_items_budgeted_amount = total_count = total_budgeted_amount = 0;

    for (let i = 0; i < budgeted_items_data.length; i++) {
        if (budgeted_items_data[i].apply_budget_on == "Item") {
            stable_items_count += budgeted_items_data[i].quantity;
            total_count += budgeted_items_data[i].quantity;
            stable_items_budgeted_amount += budgeted_items_data[i].amount;
            total_budgeted_amount += budgeted_items_data[i].amount;
        } else {
            fluctuating_items_count += budgeted_items_data[i].quantity;
            total_count += budgeted_items_data[i].quantity;
            fluctuating_items_budgeted_amount += budgeted_items_data[i].amount;
            total_budgeted_amount += budgeted_items_data[i].amount;
        };
    };

    frm.set_value("stable_items_count",stable_items_count);
    frm.set_value("fluctuating_items_count",fluctuating_items_count);
    frm.set_value("stable_items_budgeted_amount",stable_items_budgeted_amount);
    frm.set_value("fluctuating_items_budgeted_amount",fluctuating_items_budgeted_amount);
    frm.set_value("total_count",total_count);
    frm.set_value("total_budgeted_amount",total_budgeted_amount);

},
});

frappe.ui.form.on("Budget Items",{

    apply_budget_on:function(frm,cdt,cdn){
        var row = locals[cdt][cdn];
        if (row.apply_budget_on == "Item Group") {
            frappe.model.set_value(cdt, cdn, 'hsn__sac_code', null);
            frappe.model.set_value(cdt, cdn, 'item_group', null);
            frappe.model.set_value(cdt, cdn, 'quantity', 0.00);
            frappe.model.set_value(cdt, cdn, 'remaining_quantity', 0.00);
            frappe.model.set_value(cdt, cdn, 'unit_price', 0.00); 
            frm.fields_dict['budgeted_items'].grid.update_docfield_property('item', 'label', 'Item Group');
            frm.fields_dict['budgeted_items'].grid.update_docfield_property('item_group', 'hidden', 1);
            frm.refresh_field('budgeted_items');
        }
        if (row.apply_budget_on == "Item") {
            frm.fields_dict['budgeted_items'].grid.update_docfield_property('item', 'label', 'Item');
            frm.fields_dict['budgeted_items'].grid.update_docfield_property('item_group', 'hidden', 0);
            frm.refresh_field('budgeted_items');
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
        if (frm.doc.project != null && frm.doc.department != null && row.item != null && frm.doc.fiscal_year != null) {
            if (row.apply_budget_on == "Item") {
                frappe.call({
                    method: "envision_finance.envision_finance.doctype.project_budget.project_budget.verifying_the_budgeted_items",
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
                            var a = 1
                        }
                        else{
                            frappe.throw(`<b>Item Already exists in another Budget</b><br><br><b>${row.item}</b> already exists in Budget: <b>${response.data[0].name}</b>`);
                        }
                    }
                });
            }
        } else if (frm.doc.project == undefined || frm.doc.project == null) {
            cur_frm.clear_table("budgeted_items");
            cur_frm.refresh_field("budgeted_items");
            frappe.msgprint("Please specify the Project");
            cur_frm.refresh();
        } else if (frm.doc.department == undefined || frm.doc.department == null) {
            cur_frm.clear_table("budgeted_items");
            cur_frm.refresh_field("budgeted_items");
            frappe.msgprint("Please specify the Department");
            cur_frm.refresh();
        }
        if (row.apply_budget_on == "Item") {
            frappe.call({
                method: "envision_finance.envision_finance.doctype.project_budget.project_budget.get_item_details",
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
});
