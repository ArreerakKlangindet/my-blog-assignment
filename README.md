# 📝 Full-Stack Blog System (Software Developer Assignment)

This repository contains the Full-Stack Blog & Comment Management platform developed strictly in accordance with the requirements specified in **recruitment_assignment_software_developer.pdf**.

---

## 🌐 Language Selection / เลือกภาษาเพื่ออ่านเอกสาร

- [English Version (#-english-documentation)](#-english-documentation)
- [ภาษาไทย (#-ภาษาไทย-thai-documentation)](#-ภาษาไทย-thai-documentation)

---

# 🇺🇸 English Documentation

A production-ready Full-Stack Blog & Comment Management platform engineered with a clean, decoupled, and highly reusable architecture. This project serves as a concrete technical validation for **Part 2**, while conceptually demonstrating the foundational practices proposed in **Part 1** regarding system scalability and development process optimization from `recruitment_assignment_software_developer.pdf`.

## 🎯 Architectural Intent & Thought Process

In alignment with the assignment's core criteria (_System Thinking, Reusability, and Handling Vague Requirements_):

1. **Monorepo Architecture (Scalability & Reuse):** Client (Frontend) and Server (Backend) are modularly separated but reside in a single monorepo. This structure is pre-configured to easily introduce additional microservices or alternative white-label frontends using shared global entities or packages in the future.
2. **Design-Token Ready UI:** Native browser popups (`alert`/`confirm`) have been fully replaced with state-driven custom Tailwind CSS modal modules. This explicitly isolates styling logic, making it trivial to inject different **Design Tokens** (colors, borders, radiuses) if this module were reused across multiple client projects.

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router, React 19), Tailwind CSS, TypeScript.
- **Backend:** NestJS, TypeORM, PostgreSQL instance.
- **Security & Validation:** Passport.js (JWT Strategy), bcrypt hashing, and strict global DTO input pipelines via `class-validator`.

## ✨ Feature Execution & Handling Vague Requirements (Based on pdf specification)

### 🔐 1. Admin Guard & Resource Control

- **Secure Authentication:** Administrative endpoints are fiercely locked behind a custom `JwtAuthGuard`.
- **Ownership Validation:** The system guarantees data integrity by performing data-layer validations ensuring that administrators can only manage, edit, or purge blog posts that map to their own `authorId`.

### 📝 2. SEO-Friendly Slug Engine & Media Layout

- **Dynamic Slug Generation:** Title strings are automatically cleaned, normalized, and converted via standard RegEx into safe URL Slugs. Administrators retain manual override flexibility within the edit panel.
- **Strict Asset Caps:** Implemented backend pipeline constraint via `@ArrayMaxSize(6)` to strictly enforce the requirement of 1 cover image + maximum 6 additional images (Max 7 images total per blog).
- **View Count Metrics:** Implemented an optimistic incrementer (`viewCount += 1`) that auto-updates upon public read invocations.

### 💬 3. Guest Comment System & Validation Approach

The requirement specifies: _"Comment text must be in Thai language and/or numbers only."_

- **Validation Strategy:** To safely implement this, the backend introduces a custom Regex validator within the input DTO class: `/^[ก-๙0-9\s.,!?-]+$/`.
- **Handling Ambiguity:** Standard punctuation, spaces, and paragraph breaks are purposely allowed alongside native Thai alphabets and digits. Excluding punctuation would break general user reading comprehension—demonstrating pragmatic decision-making when dealing with vague functional rules.
- **State Moderation Workflow:** Comments inherit a default status of `PENDING`[cite: 1]. Administrators possess full operational overrides to `APPROVE` or `REJECT` any thread, including the explicit capability to reverse previous approvals back to a rejected state at any point in time[cite: 1].

## 🚀 Getting Started

### 📦 Dependencies Installation

```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && npm install
```
