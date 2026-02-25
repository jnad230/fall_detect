export const CHECKLIST = [
    {
        id: "immediate",
        phase: "IMMEDIATE RESPONSE",
        color: "#ff1744",
        items: [
            { id: "drsabcd", text: "Basic life support — Danger, Responsive, Send for Help, Airway, Breathing, CPR, Defib (DRSABCD)" },
            { id: "pain", text: "Rapid assessment — check for pain, bleeding, injury, fracture" },
            { id: "nomove", text: "Do not move until assessed — examine cervical spine and immobilise if injury indicated" },
            { id: "obs", text: "Take observations — BP, P, R, T, SpO₂, Blood Glucose, Pain Score, Neuro Observations" },
            { id: "notify", text: "Notify Medical Officer of fall using ISBAR" },
        ],
    },
    {
        id: "ongoing",
        phase: "ONGOING OBSERVATIONS",
        color: "#ffc400",
        items: [
            { id: "hourly", text: "Monitor BP, P, R, T, SpO₂, Pain Score, Neuro Obs at least hourly for 4 hours" },
            { id: "sepsis", text: "Check for sepsis — risk factors, signs of infection, yellow zone observations?" },
            { id: "delirium", text: "Check for delirium — fluctuating cognition, behaviour changes, confusion? Complete CAM if yes" },
            { id: "head", text: "Check for head injury — anticoagulants, GCS changes, facial bruising, age ≥65?" },
        ],
    },
    {
        id: "communicate",
        phase: "COMMUNICATE",
        color: "#00b0ff",
        items: [
            { id: "reassure", text: "Reassure patient and explain all treatment and investigations" },
            { id: "report", text: "Report fall to medical officer for review" },
            { id: "family", text: "Notify family / carer / person responsible about the fall" },
            { id: "careplan", text: "Implement care plan and inform all staff" },
            { id: "handover", text: "Include falls risk and interventions in clinical handover" },
        ],
    },
    {
        id: "document",
        phase: "DOCUMENT",
        color: "#00e676",
        items: [
            { id: "record", text: "Document treatment, palliation/escalation and outcome in clinical record" },
            { id: "highrisks", text: "Change falls status to HIGH RISK in clinical record and update care plan" },
            { id: "iims", text: "Complete IIMS report and note incident and IIMS number in clinical record" },
            { id: "review", text: "Complete fall event review with ward clinical leadership team" },
        ],
    },
];