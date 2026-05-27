# Phase 4E Label Template Runbook

Use this runbook when configuring pharmacy barcode label layouts.

## Create Template

From Pharmacy inventory, create a label template with:

- template name
- type: `item`, `lot`, `bin`, or `generic`
- language: `zpl`, `escpos`, or `html`
- optional width/height in mm
- enabled fields as comma-separated values such as `title,subtitle,barcode,detail`
- optional header and footer text
- default flag

## Export With Template

In the scanner panel:

- select printer profile
- select label template
- export ZPL or ESC/POS

The print job stores `label_template_id` and renders labels with the selected
template fields.

## Fallback

If a template is wrong, select `Default format` or deactivate/update the
template before exporting more labels.
