app_name = "envision_finance"
app_title = "Envision Finance"
app_publisher = "Dhruvil Mistry"
app_description = "An app for development of Accounting and Budget Modules for Envision Enviro Tech"
app_email = "dhruvil@sanskartechnolab.com"
app_license = "mit"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "envision_finance",
# 		"logo": "/assets/envision_finance/logo.png",
# 		"title": "Envision Finance",
# 		"route": "/envision_finance",
# 		"has_permission": "envision_finance.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/envision_finance/css/envision_finance.css"
# app_include_js = "/assets/envision_finance/js/envision_finance.js"

# include js, css files in header of web template
# web_include_css = "/assets/envision_finance/css/envision_finance.css"
# web_include_js = "/assets/envision_finance/js/envision_finance.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "envision_finance/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "envision_finance/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "envision_finance.utils.jinja_methods",
# 	"filters": "envision_finance.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "envision_finance.install.before_install"
# after_install = "envision_finance.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "envision_finance.uninstall.before_uninstall"
# after_uninstall = "envision_finance.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "envision_finance.utils.before_app_install"
# after_app_install = "envision_finance.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "envision_finance.utils.before_app_uninstall"
# after_app_uninstall = "envision_finance.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "envision_finance.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

override_doctype_class = {
    "Purchase Order": "envision_finance.public.overrides.purchase_order.PurchaseOrder",
    "Purchase Invoice": "envision_finance.public.overrides.purchase_invoice.PurchaseInvoice",
    "Journal Entry": "envision_finance.public.overrides.journal_entry.JournalEntry",
}

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"envision_finance.tasks.all"
# 	],
# 	"daily": [
# 		"envision_finance.tasks.daily"
# 	],
# 	"hourly": [
# 		"envision_finance.tasks.hourly"
# 	],
# 	"weekly": [
# 		"envision_finance.tasks.weekly"
# 	],
# 	"monthly": [
# 		"envision_finance.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "envision_finance.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "envision_finance.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
override_doctype_dashboards = {
	"Project": "envision_finance.public.overrides.project_dashboard.get_data"
}

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["envision_finance.utils.before_request"]
# after_request = ["envision_finance.utils.after_request"]

# Job Events
# ----------
# before_job = ["envision_finance.utils.before_job"]
# after_job = ["envision_finance.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"envision_finance.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

fixtures = [
    "Custom DocPerm",
    "Workspace",
    "Workflow State",
    "Workflow Action",
    "Workflow",
    "Role",
    "Role Profile"
]