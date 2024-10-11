frappe.ui.form.on("Project Budget", {

refresh(frm) {

    // Adding a Refresh Button
    frm.add_custom_button(__('<i class="fa fa-refresh"></i>'),function(){
        window.location.reload()
    });
    if (frm.doc.docstatus == 0) {
        // Add upload button for both grids
        addUploadButton(frm, "budgeted_items");
        addUploadButton(frm, "timeline_details");
        
        // Load SheetJS and add the download buttons for both grids
        loadSheetJS(function() {
            addDownloadTableDataButton(frm, "budgeted_items");
        addDownloadTableDataButton(frm, "timeline_details");
        });
    }
    if (frm.doc.workflow_state == "Adjusted"){
        frappe.model.set_value("Project Budget",frm.doc.name,"disable",1)
    }
    if ((["Pending", "Rework","Budget Review"].includes(frm.doc.workflow_state)) && frm.doc.is_adjustment == 1){
        frm.add_custom_button(__("Get Logs"), function(){
            fetching_logs(frm.doc.name, frm.doc.budget_that_will_be_adjusted)
        })
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
    frm.set_query("cost_estimation", function() {
        return {
            filters: {
                "department": frm.doc.department
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
        else{
            frm.set_value('department',null);
        }
    });
},

before_save: function (frm) {
    if(frm.doc.applicable_on_purchase_order == 0 && frm.doc.applicable_on_purchase_invoice == 0 && frm.doc.applicable_on_journal_entry == 0){
        frappe.throw("Please select at least one of the Control Action/s");
    }
    else{
        frm.set_value("is_used",1)
    }

    let timeline_data = frm.doc.timeline_details;
    let timeline_data_total = 0

    timeline_data.forEach(data => {
        // Calculate total for the row
        var timeline_data_total = 
            (data.january || 0) + (data.february || 0) + (data.march || 0) + 
            (data.april || 0) + (data.may || 0) + (data.june || 0) + 
            (data.july || 0) + (data.august || 0) + (data.september || 0) + 
            (data.october || 0) + (data.november || 0) + (data.december || 0);
    
        // Set the total field in the child row
        frappe.model.set_value(data.doctype, data.name, 'total', timeline_data_total);
    });
    frm.refresh_field('timeline_details');

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

// Function to add upload button
function addUploadButton(frm, gridField) {
    frm.fields_dict[gridField].grid.add_custom_button(__('Upload'), function() {
        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.xlsx';

        fileInput.addEventListener('change', function(event) {
            handleFileUpload(event.target.files[0], gridField);
        });

        fileInput.click();
    });
}

// Function to handle file upload
function handleFileUpload(file, gridField) {
    if (!file) {
        frappe.msgprint(__('No file selected.'));
        return;
    }

    var reader = new FileReader();
    if (file.name.endsWith('.xlsx')) {
        reader.onload = function(event) {
            var data = new Uint8Array(event.target.result);
            var workbook = XLSX.read(data, { type: 'array' });
            
            // Assuming the first sheet is what we need
            var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            var jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
            processXLSXData(jsonData, gridField); // Process XLSX data based on grid field
        };
        reader.readAsArrayBuffer(file); // Read XLSX as array buffer
    }
}

// This function processes the JSON data extracted from the XLSX file
function processXLSXData(jsonData, gridField) {
    var items = [];

    // Loop through the JSON data (each row) and map it to fields
    jsonData.forEach(function(row) {
        var item = {};

        if (gridField === 'budgeted_items') {
            // Map fields for budgeted_items
            item['apply_budget_on'] = row['Apply Budget on'] || '';
            item['item'] = row['Item'] || '';
            item['hsn__sac_code'] = row['HSN/SAC Code'] || '';
            item['item_group'] = row['Item Group'] || '';
            item['uom'] = row['UOM'] || '';
            item['quantity'] = row['Quantity'] || 0;
            item['remaining_quantity'] = row['Remaining Quantity'] || 0;
            item['unit_price'] = row['Unit Price'] || 0;
            item['amount'] = row['Amount'] || 0;
            item['current_budget'] = row['Current Budget'] || 0;
        } else if (gridField === 'timeline_details') {
            // Map fields for timeline_details
            item['apply_budget_on'] = row['Apply Budget on'] || '';
            item['item'] = row['Item'] || '';
            item['item_group'] = row['Item Group'] || '';
            item['january'] = row['January'] || 0;
            item['february'] = row['February'] || 0;
            item['march'] = row['March'] || 0;
            item['april'] = row['April'] || 0;
            item['may'] = row['May'] || 0;
            item['june'] = row['June'] || 0;
            item['july'] = row['July'] || 0;
            item['august'] = row['August'] || 0;
            item['september'] = row['September'] || 0;
            item['october'] = row['October'] || 0;
            item['november'] = row['November'] || 0;
            item['december'] = row['December'] || 0;
            item['total'] = row['Total Amount'] || 0;
        }

        items.push(item);
    });

    populateChildTable(items, gridField); // Populate child table with the extracted data
}

// This function populates the child table in Frappe with the extracted data
function populateChildTable(items, gridField) {
    var frm = cur_frm; // Get the current form instance

    // Clear existing child table rows
    frm.clear_table(gridField);

    // Add new rows based on the uploaded data
    items.forEach(function(item) {
        frm.add_child(gridField, item);
    });

    // Refresh the child table to display the newly added rows
    frm.refresh_field(gridField);

    frappe.msgprint(_("The data has been successfully imported into the table."));
}

// Function to load SheetJS dynamically if not already loaded
function loadSheetJS(callback) {
    if (typeof XLSX === 'undefined') {
        var script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js";
        script.onload = callback;
        document.head.appendChild(script);
    } else {
        callback();
    }
}

// Function to add download button for exporting table data
function addDownloadTableDataButton(frm, gridField) {
    frm.fields_dict[gridField].grid.add_custom_button(__('Download'), function() {
        downloadTableDataXLSX(frm, gridField);
    });
}

// Function to download table data as XLSX based on gridField
function downloadTableDataXLSX(frm, gridField) {
    var headers, data = [];

    // Define headers and collect data based on the grid field
    if (gridField === "budgeted_items") {
        headers = [
            ['Apply Budget on', 'Item', 'HSN/SAC Code', 'Item Group', 'UOM', 'Quantity', 'Unit Price', 'Amount', 'Current Budget', 'Remaining Quantity']
        ];
        
        frm.doc.budgeted_items.forEach(function(row) {
            data.push([
                row.apply_budget_on,
                row.item,
                row.hsn_sac_code,
                row.item_group,
                row.uom,
                row.quantity,
                row.unit_price,
                row.amount,
                row.current_budget,
                row.remaining_quantity
            ]);
        });
    } else if (gridField === "timeline_details") {
        headers = [
            ['Apply Budget on', 'Item', 'Item Group', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December','Total Amount']
        ];
        
        frm.doc.timeline_details.forEach(function(row) {
            data.push([
                row.apply_budget_on,
                row.item,
                row.item_group,
                row.january,
                row.february,
                row.march,
                row.april,
                row.may,
                row.june,
                row.july,
                row.august,
                row.september,
                row.october,
                row.november,
                row.december,
                row.total_amount
            ]);
        });
    }

    // Create a new workbook and worksheet
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.aoa_to_sheet(headers.concat(data));

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Table Data");

    // Download the XLSX file with a dynamic file name based on gridField
    var fileName = (gridField === "budgeted_items") ? "budgeted_items_data.xlsx" : "budgeted_timeline_data.xlsx";
    XLSX.writeFile(wb, fileName);
}
function fetching_logs(new_budget, old_budget){
    frappe.call({
        method: "envision_finance.envision_finance.doctype.project_budget.project_budget.setting_logs_in_new_budget",
        args:{
            new_budget: new_budget,
            old_budget: old_budget
        },
    });
}