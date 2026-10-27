# M0.2 — Taxonomy and Catalog

**Source of truth:** `../data/concepts.csv` (100 rows); category ownership is exclusive.

Navigation is grouped into **six sections**. There are **20 categories**, each with five initial candidate concepts. The first listed item is the **M1 seed page**.

## Principles

- Each concept has one canonical owning category; other categories cross-link rather than duplicate articles.
- Stable `concept_id` is independent of URL, file path, name, or future translations.
- Acronyms, organization names and standard numbers need entity-type metadata and careful definitions.
- Categories are for discovery; relation types convey conceptual dependencies.
- Every category must receive one reviewed article in M1.

## Programming Foundations

### Programming Language Concepts
- **Category ID:** `programming-language-concepts`
- **Candidate concepts:** **Idiomatic Programming**; Generics; Mutation; Abstraction; Reflection.

### Type Systems
- **Category ID:** `type-systems`
- **Candidate concepts:** **Type Inference**; Covariance; Contravariance; Structural Typing; Refinement Types.

### Functional Programming
- **Category ID:** `functional-programming`
- **Candidate concepts:** **Pure Function**; Referential Transparency; Immutability; Closure; Lazy Evaluation.

### OOP & Design Patterns
- **Category ID:** `oop-design-patterns`
- **Candidate concepts:** **Observer Pattern**; Adapter Pattern; Strategy Pattern; Dependency Injection; Composition.

## Runtime & Systems

### Concurrency & Parallelism
- **Category ID:** `concurrency-parallelism`
- **Candidate concepts:** **Atomic Operation**; Concurrency; Parallelism; Data Race; Deadlock.

### Operating Systems & Memory
- **Category ID:** `operating-systems-memory`
- **Candidate concepts:** **Virtual Memory**; Process; Thread; Memory Leak; Copy-on-Write.

### I/O & Networking
- **Category ID:** `io-networking`
- **Candidate concepts:** **Input/Output (I/O)**; Blocking I/O; Non-blocking I/O; Event Loop; Backpressure.

### Compilers & Runtimes
- **Category ID:** `compilers-runtimes`
- **Candidate concepts:** **Abstract Syntax Tree (AST)**; Compiler; Interpreter; Just-in-Time Compilation; Undefined Behavior.

## Data & Distributed Computing

### HTTP, APIs & Integration
- **Category ID:** `http-api-integration`
- **Candidate concepts:** **HTTP Method Semantics**; REST; Webhook; Content Negotiation; API Versioning.

### Databases & Transactions
- **Category ID:** `databases-transactions`
- **Candidate concepts:** **Transaction Isolation Levels**; ACID; MVCC; Optimistic Locking; Serializability.

### Distributed Systems
- **Category ID:** `distributed-systems`
- **Candidate concepts:** **Idempotency**; Eventual Consistency; Consensus; Circuit Breaker; Transactional Outbox.

### Data Structures & Algorithms
- **Category ID:** `data-structures-algorithms`
- **Candidate concepts:** **Bloom Filter**; Big O Notation; Hash Table; Directed Acyclic Graph (DAG); Amortized Analysis.

## Security & Architecture

### Application Security
- **Category ID:** `application-security`
- **Candidate concepts:** **OWASP**; Attack Surface; Injection Vulnerabilities; Server-Side Request Forgery (SSRF); Threat Modeling.

### Authentication & Cryptography
- **Category ID:** `authentication-cryptography`
- **Candidate concepts:** **OAuth 2.0**; Authentication; Authorization; Digital Signatures; Nonce.

### Software Architecture
- **Category ID:** `software-architecture`
- **Candidate concepts:** **Bounded Context**; Hexagonal Architecture; CQRS; Modular Monolith; Coupling.

## Quality & Operations

### Testing & Verification
- **Category ID:** `testing-verification`
- **Candidate concepts:** **Mutation Testing**; Test-Driven Development (TDD); Property-Based Testing; Formal Verification; Flaky Test.

### Performance Engineering
- **Category ID:** `performance-engineering`
- **Candidate concepts:** **Tail Latency**; Latency; Throughput; Cache Stampede; Amdahl's Law.

### DevOps & CI/CD
- **Category ID:** `devops-ci-cd`
- **Candidate concepts:** **Software Bill of Materials (SBOM)**; Continuous Integration; Immutable Infrastructure; Build Provenance; Canary Deployment.

### Observability & SRE
- **Category ID:** `observability-sre`
- **Candidate concepts:** **Observability**; Distributed Tracing; Service Level Objective (SLO); Error Budget; Root Cause Analysis.

## AI Engineering

### AI, LLMs & Agents
- **Category ID:** `ai-llms-agents`
- **Candidate concepts:** **Tool Calling**; Inference; Embeddings; Retrieval-Augmented Generation (RAG); Prompt Injection.

## Known boundary cases

- `OWASP` is a **foundation/ecosystem**, not the name of a vulnerability, exploit, or generic coding technique. Its article must contrast OWASP, OWASP Top 10, ASVS, CWE and CVE.
- `Atomic Operation` describes atomic shared-memory primitives, while the database ACID entry discusses **transaction atomicity**; distinguish them explicitly.
- `Idempotency` is a general operation property. HTTP-specific idempotent method semantics belong in `HTTP Method Semantics` with a reference to RFC 9110.
- `Mutation` is a state-change operation; `Mutation Testing` is a method for evaluating test suites.
- `Idiomatic Programming` depends on a language/community and should not be presented as a universal syntactic rule.
- `Input/Output (I/O)` is a broader notion than blocking, non-blocking or asynchronous execution.

## Initial catalog rules

A proposed concept can be renamed, split or moved during editorial review. After publication, retain its stable ID and handle changed routes by redirects. Catalogue rows carry `planned` status by default; no page is implied to exist.
