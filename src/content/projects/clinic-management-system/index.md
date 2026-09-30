---
title: "Clinic Management System"
summary: "A C# Windows Forms clinic system built with two teammates: a Facade over the patient, appointment and billing services, Strategy-based billing, and an Adapter that exports invoices to PDF."
featured: true
order: 72
tags: ["C#", "Windows Forms", "Design Patterns", "UML"]
cover: ./cover.png
coverAlt: "The Billing and Checkout form: an appointment selected, the billing strategy set to Standard, payment by cash, Checkout and Export PDF buttons, and one invoice of 150 in the grid."
metrics:
  - value: "3 patterns"
    label: "Facade, Strategy and Adapter"
  - value: "8 forms"
    label: "Windows Forms screens"
---

A clinic management desktop application in C# and Windows Forms, designed and built with
two teammates for the Object-Oriented Design course. It registers patients and doctors,
manages departments, rooms and time slots, books appointments after checking that the
slot and the doctor are free, keeps medical records and prescriptions, and bills each
visit.

The design rests on three Gang of Four patterns. A ClinicManagementFacade gives the forms
two simple operations, BookAppointment and CheckoutPatient, so the UI never coordinates
the patient, appointment and billing services itself. Billing is a Strategy: standard,
insurance and emergency rules each implement IBillingStrategy, so a new rule is a new
class, not a change to BillingService. Invoices export to PDF through an Adapter that
hides the PDFsharp library behind a small IPDFExporter interface.

![Part of the UML class diagram: the ClinicManagementFacade above the billing, appointment and patient services, the IBillingStrategy interface with its three implementations, and the PDF exporter interface with its adapter.](./design-patterns.png)

The same visit shows the Strategy at work: a $150 consultation on the billing screen
becomes a $30 invoice under the insurance rule, which charges 20% of the fee.

![The Billing and Checkout form: an appointment selected, the billing strategy set to Standard, payment by cash, Checkout and Export PDF buttons, and one invoice of 150 in the grid.](./billing-checkout.png)

![The generated PDF invoice: invoice 1, amount $30.00, status paid, payment method card.](./invoice.png)
