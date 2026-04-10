# Project Overview

## Purpose

This project starts with a practical Electronic Medical Record (EMR) core intended for real clinical workflows. The first objective is not chat, telemedicine, or automation. It is a safe and structured medical record platform that can later support additional digital care channels.

## Product Direction

The system is planned around these ideas:

- EMR first
- clinical data as the source of truth
- modular expansion for LINE and telemedicine later
- structured, auditable healthcare data
- workflow support for clinics, practitioners, and staff

## Initial In-Scope Areas

- patient profile
- patient health background
- allergy, condition, and medication history
- consent records
- appointments
- encounters or visits
- SOAP notes
- diagnoses
- vital signs
- attachments
- users, roles, and permissions
- audit logging

## First-Phase Out of Scope

- full telemedicine sessions
- full LINE automation
- chatbot or AI diagnosis
- full HIS or FHIR integration
- billing, insurance claims, and inventory

## Primary User Groups

- practitioners who need fast clinical context and efficient documentation
- nurses and front-desk staff who manage registration, scheduling, and check-in
- administrators who manage access, governance, and auditability
- developers who need clear domain boundaries for future implementation

## Delivery Approach

This repository is intentionally starting with architecture and documentation only. The purpose is to align the team on structure before code, schema, and integrations are introduced.
