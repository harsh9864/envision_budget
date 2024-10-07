frappe.ui.form.on("Project Budget", {

    refresh(frm) {
        if(frm.doc.docstatus == 0){
        // Add the upload button for file input
        frm.fields_dict["budgeted_items"].grid.add_custom_button(__('Upload'), function() {
            // Create a file input element dynamically
            var fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.csv,.xlsx'; // Accept both CSV and XLSX files
            
            // Trigger the file selection when the file input changes
            fileInput.addEventListener('change', function(event) {
                handleFileUpload(event.target.files[0]);
            });

            // Trigger the file input click event
            fileInput.click();
        });
        // Load SheetJS dynamically if it's not already loaded
        if (typeof XLSX === 'undefined') {
            var script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js";
            script.onload = function() {
                // Add the download button after the library is loaded
                frm.fields_dict["budgeted_items"].grid.add_custom_button(__('Download'), function() {
                    downloadXLSXTemplate();
                });
            };
            document.head.appendChild(script);
        }
    }
    },

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
    if(frm.doc.applicable_on_purchase_order == 0 && frm.doc.applicable_on_purchase_invoice == 0 && frm.doc.applicable_on_journal_entry == 0 && frm.doc.applicable_on_payroll_entry == 0){
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
        } 
        else if (frm.doc.project == undefined || frm.doc.project == null) {
            cur_frm.clear_table("budgeted_items");
            cur_frm.refresh_field("budgeted_items");
            frappe.msgprint("Please specify the Project");
            cur_frm.refresh();
        } 
        else if (frm.doc.department == undefined || frm.doc.department == null) {
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

// Function to handle file upload
function handleFileUpload(file) {
    if (!file) {
        frappe.msgprint(__('No file selected.'));
        return;
    }

    var reader = new FileReader();
    if(file.name.endsWith('.xlsx')) {
        reader.onload = function(event) {
            var data = new Uint8Array(event.target.result);
            var workbook = XLSX.read(data, { type: 'array' });
            
            // Assuming the first sheet is what we need
            var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            var jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
            processXLSXData(jsonData); // Process XLSX data
        };
        reader.readAsArrayBuffer(file); // Read XLSX as array buffer
    }
}

// This function processes the JSON data extracted from the XLSX file
function processXLSXData(jsonData) {
    var pressItems = [];

    // Loop through the JSON data (each row)
    jsonData.forEach(function(row) {
        var pressItem = {};
        
        // Map the fields from your XLSX to the child table fields
        pressItem['apply_budget_on'] = row['Apply Budget on'] || '';
        pressItem['item'] = row['Item'] || '';
        pressItem['hsn__sac_code'] = row['HSN/SAC Code'] || '';
        pressItem['item_group'] = row['Item Group'] || '';
        pressItem['uom'] = row['UOM'] || '';
        pressItem['quantity'] = row['Quantity'] || 0;
        pressItem['remaining_quantity'] = row['Remaining Quantity'] || 0;
        pressItem['unit_price'] = row['Unit Price'] || 0;
        pressItem['amount'] = row['Total Budget'] || 0;
        pressItem['current_budget'] = row['Total Budget'] || 0;

        pressItems.push(pressItem);
    });

    populateChildTable(pressItems); // Populate child table with the extracted data
}

// This function populates the child table in Frappe with the extracted data
function populateChildTable(pressItems) {
    var frm = cur_frm; // Get the current form instance

    // Clear existing child table rows
    frm.clear_table('budgeted_items');

    // Add new rows based on the uploaded data
    for (var k = 0; k < pressItems.length; k++) {
        var child = frm.add_child('budgeted_items', pressItems[k]);
    }

    // Refresh the child table to display the newly added rows
    frm.refresh_field('budgeted_items');

    frappe.msgprint(__('File data has been successfully loaded into the child table.'));
}

// Function to download the XLSX template
function downloadXLSXTemplate() {
    // Define the headers for the XLSX (same as your child table fields)
    var headers = [
        ['Apply Budget on', 'Item','HSN/SAC Code', 'Item Group', 'UOM','Quantity', 'Unit Price', 'Amount', 'Current Budget', 'Remaining Quantity']
    ];

    // Create a new workbook and worksheet
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.aoa_to_sheet(headers);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    // Download the XLSX file
    XLSX.writeFile(wb, "budgeted_items_template.xlsx");
}