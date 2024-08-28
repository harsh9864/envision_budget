frappe.ui.form.on("Item wise Budget", {

    quotation: function(frm) {
        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Quotation",
                name: frm.doc.quotation
            },
            callback:function(response){
                console.log(response.message.items)
                let row = response.message.items
                frm.clear_table("budgeted_items");
                row.forEach(data => {
                    console.log(data.item_code);
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
});

frappe.ui.form.on("Budget Items",{

    
    quantity:function(frm,cdt,cdn){
        var row = locals[cdt][cdn];
        var amount = row.quantity * row.unit_price;
        if(amount == NaN){
            frappe.model.set_value(cdt, cdn, 'amount', 0);
        }
        else{
            console.log(amount)
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
            console.log(amount)
            frappe.model.set_value(cdt, cdn, 'amount', amount);
        }

    },
    amount:function(frm,cdt,cdn){
        var row = locals[cdt][cdn];
        frappe.model.set_value(cdt, cdn, 'current_budget', row.amount);
    },

    item:function(frm,cdt,cdn){
        // Get the current row
        var row = locals[cdt][cdn];
        // Call the backend method to verify the item
        frappe.call({
            // Method to call
            method: "envision_finance.envision_finance.doctype.item_wise_budget.item_wise_budget.verifying_the_budgeted_items",
            // Arguments to pass
            args:{
                project: frm.doc.project, // Project from the current form
                department: frm.doc.department, // Department from the current form
                item:row.item // Item from the current row
            },
            // Callback function to handle the response
            callback:function(response){
                // If no data is returned, log a message
                if(response.data == null){
                    console.log("...")
                }
                // If data is returned, throw an error with the budget name
                else{
                    frappe.throw(`<b>Item Already exists in another Budget</b><br><br><b>${row.item}</b> already exists in Budget: <b>${response.data[0].name}</b>`)
                }
            }
        })
    }
})