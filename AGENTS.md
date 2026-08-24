# AGENTS.md — SatQuery AI (SIH26167) — Master Build Instructions

You are building **SatQuery AI** for **SIH26167: SatQuery AI — Vision-Language Assistant for Remote Sensing / Satellite Data**.

SatQuery AI is a natural-language assistant that answers questions about Earth observation data by planning and executing **real geospatial operations against real satellite archives**, then presenting the result with complete evidence, provenance, acquisition dates, and computed data confidence.

## Read order — mandatory

Before writing or changing any code:

1. Read `SPEC.md` completely. It is the implementation contract.
2. Read `TASKS.md` and select exactly one ticket.
3. Check the current repository state before modifying anything.
4. Verify required third-party endpoints using the appropriate smoke command before building against them.

`AGENTS.md` defines **how you work**.
`SPEC.md` defines **what you build**.
`TASKS.md` defines **what you build next**.

Do not invent architecture that contradicts `SPEC.md`. If the specification appears incorrect, outdated, impossible, or internally inconsistent, stop and write a decision note proposing the correction before implementing an alternative.

---

# 1. THE OVERRIDING RULE: NO FABRICATED DATA

This project is judged on whether the information displayed to the user is true.

Never fabricate, simulate, invent, estimate, guess, or silently substitute data.

Forbidden everywhere, including scaffolding, frontend development, demos, tests, and prototypes:

* `faker`
* `Math.random()`
* `numpy.random`
* Randomly generated measurements, coordinates, dates, counts, areas, percentages, confidence values, or statistics
* Hardcoded sample NDVI/NDWI/NDBI/change values
* Invented satellite scenes or product IDs
* Placeholder GeoJSON with semantic content
* Invented place coordinates
* Fake charts, maps, tables, metrics, confidence scores, or imagery
* Mock HTTP layers that return synthetic payloads pretending to be upstream APIs
* Fake loading results that later become displayed measurements
* Silent fallback values
* `sample_`, `dummy`, `mock`, or `TODO: real data` implementations that reach the user

A chart, map, table, confidence indicator, statistic, or answer may only be rendered from a **completed deterministic operation result**.

If credentials, an upstream API, imagery, the LLM, network connectivity, or a model are unavailable:

* Raise the appropriate typed error.
* Show a blocking and specific user-facing message.
* Never substitute fake data to keep the demo running.

If a feature cannot currently be completed with real data, leave it unbuilt and explain why.

A missing feature is acceptable. A fabricated feature is not.

Run the repository's no-dummy checks before marking work complete.

---

# 2. RECORDED REAL DATA IS PERMITTED

Offline testing and demo mode may use recorded responses only if those responses originally came from a real upstream service.

Store them under:

`fixtures/recorded/<op>/<hash>.json`

Record metadata in:

`fixtures/recorded/manifest.json`

including:

* `source_url`
* request body SHA256
* fetch timestamp
* HTTP status

Every recorded fixture must be reproducible through the repository's recording workflow.

Offline mode must clearly tell the user that it is replaying a recorded real run. Never disguise replayed data as a fresh live API result.

---

# 3. THE MODEL NEVER MEASURES

The LLM is responsible for:

* Understanding the natural-language question
* Producing a validated `GeoPlan`
* Restating the analysis question
* Selecting from known deterministic operations through the plan schema
* Narrating completed evidence
* Providing constrained visual description or verification where specified

The LLM is NOT allowed to:

* Calculate NDVI or any remote-sensing index
* Calculate areas, counts, percentages, means, standard deviations, or confidence
* Estimate a quantity
* Guess a date
* Invent coordinates
* Invent scene IDs
* Invent product IDs
* Produce measurements without evidence
* Emit executable Python, SQL, shell commands, evalscripts, or arbitrary code that will be executed

The LLM emits a validated `GeoPlan` JSON document only.

Every numerical value shown to the user must originate from a deterministic operation in `api/app/ops/` or another explicitly approved deterministic component defined in `SPEC.md`.

Unknown operations must be rejected.

---

# 4. NUMERIC GROUNDING IS A HARD GATE

The composer receives only:

* The original question
* The executed plan
* Completed operation outputs
* Retrieved knowledge-base snippets where permitted
* Computed confidence data

It must use no outside facts for measurements.

`api/app/core/numeric_guard.py` must validate numeric tokens in generated responses against the evidence set.

If an unsupported number appears:

1. Regenerate once with the violation identified.
2. If it still fails, remove the unsupported sentence.
3. Log `numeric_guard.violation`.
4. Never display an unsupported measurement merely because the answer sounds plausible.

This is a blocking correctness mechanism, not a warning.

---

# 5. BUILD THE SPEC, DO NOT SUBSTITUTE THE STACK

Use the stack defined in `SPEC.md`.

Do not replace technologies for convenience.

Core stack:

| Layer              | Required choice                                        |
| ------------------ | ------------------------------------------------------ |
| API                | Python 3.11, FastAPI, Pydantic v2, httpx, uvicorn      |
| Geospatial         | rasterio, numpy, shapely, pyproj, geopandas, rio-tiler |
| Database           | PostgreSQL 16 + PostGIS 3.4 + pgvector                 |
| Jobs               | PostgreSQL-backed job table + asyncio worker           |
| Frontend           | React 18 + TypeScript + Vite                           |
| Map                | MapLibre GL JS                                         |
| Client state       | TanStack Query + Zustand                               |
| LLM                | Provider-swappable Gemini or Ollama                    |
| Semantic embedding | SigLIP `google/siglip-so400m-patch14-384` text tower   |
| KB embedding       | `BAAI/bge-small-en-v1.5`                               |
| Primary imagery    | Copernicus Data Space Ecosystem                        |
| Containers         | Docker Compose                                         |

Do not introduce Celery, Redis, RabbitMQ, Kafka, microservices, Kubernetes, or unnecessary infrastructure for the prototype.

No new runtime dependency may be added unless the existing stack cannot solve the problem and the reason is documented in `SPEC.md` first.

---

# 6. PRIMARY SYSTEM WORKFLOW

The application must follow this architecture:

User question
→ Natural-language planner
→ Validated GeoPlan
→ Deterministic operation registry
→ Real geospatial/satellite data operations
→ Evidence + artifacts + provenance
→ Deterministic confidence calculation
→ Grounded composer
→ Numeric guard
→ Final answer and interactive evidence UI

The LLM must never bypass the deterministic operation layer.

The application is a **satellite intelligence / ground-station console**, not a generic chatbot with a map attached.

---

# 7. REAL DATA SOURCES AND INTEGRATION

The critical path must use real data sources specified in `SPEC.md`.

Primary sources include:

* Copernicus Data Space Ecosystem
* Sentinel-2 L2A as the primary optical imagery source
* Sentinel-1 GRD where the specified workflow requires SAR/cloud-penetrating alternatives
* CDSE STAC catalogue for scene discovery
* Sentinel Hub Process API for raster rendering
* Sentinel Hub Statistical API for efficient time-series analysis
* OSM Nominatim for supported place resolution
* Major TOM / SigLIP embeddings for semantic text-to-imagery retrieval where that subsystem is enabled

Optional national context layers must never become a critical dependency.

Every external endpoint must be verified before implementation.

If an endpoint has moved or returns an unexpected response, stop and report the problem instead of guessing a replacement.

---

# 8. IMPLEMENT ONLY KNOWN, VALIDATED OPERATIONS

Use the operation registry and GeoPlan contract defined in `SPEC.md`.

The LLM selects known operations; it does not create new arbitrary operations at runtime.

The v1 operation set is:

1. `resolve_aoi`
2. `search_scenes`
3. `pick_scenes`
4. `render_bands`
5. `compute_index`
6. `zonal_stats`
7. `time_series`
8. `change_detect`
9. `semantic_search`
10. `vlm_describe`

Each operation must:

* Live in its own file under `api/app/ops/`
* Have typed Pydantic arguments
* Return deterministic results for the same args and cache state
* Return artifacts by path, never raw bytes in the operation result
* Include provenance for upstream data
* Have tests using real recorded fixtures where applicable

Do not add an unregistered operation casually.

---

# 9. DATA CONFIDENCE MUST BE COMPUTED, NOT INVENTED

Never display a confidence, accuracy, reliability, or trust percentage generated by an LLM.

Confidence must be calculated deterministically according to `core/confidence.py` and the formula/logic defined in `SPEC.md`.

The UI must explain the confidence components.

Low-quality optical data must not be presented as a trustworthy answer simply because a scene exists.

If there is insufficient usable data:

* Say so explicitly.
* Explain the reason.
* Show the nearest useful window where supported.
* Offer the appropriate next path where defined.

Data honesty is a feature.

---

# 10. UI/UX REQUIREMENTS — HACKATHON DEMO QUALITY

Build a visually distinctive, polished, professional interface suitable for a national hackathon demonstration.

Do not create:

* A generic SaaS dashboard
* A generic chatbot page
* A dark slate dashboard with random neon accents
* Excessive cards
* Decorative metrics
* Fake visualizations
* Rainbow map styling
* Unnecessary animations
* UI elements with no real backend operation

The design identity must be a **professional satellite ground-station / Survey of India-inspired analytical console**.

## Visual direction

Use the design system defined in `SPEC.md`:

* Toposheet/paper-inspired background
* Disciplined ink-like typography and hairline rules
* Semantic colors reserved for their data meaning
* Monospace typography for measurements, coordinates, dates, bands, durations, and technical evidence
* Strong hierarchy
* Clean cartographic presentation
* Minimal but highly intentional animation

Do not use color decoratively.

## Signature UI element: Plan Tape

The right side of the interface must feature the execution plan as a visible ground-station log.

For every step, show relevant real execution information such as:

* Step ID
* Operation name
* Execution status
* Duration
* Relevant bands/parameters
* Scene selection information
* Cache state where appropriate
* Processing information where available

Each step must be expandable to show:

* Validated arguments
* Provenance
* Relevant upstream URLs
* Raw completed result data where appropriate

The plan tape is simultaneously:

* Progress indicator
* Evidence interface
* Provenance interface
* Technical differentiator
* Trust mechanism

Drive its execution state from real backend events.

## Main layout

The main screen should prioritize:

1. Persistent natural-language query bar
2. Interactive MapLibre map
3. Result imagery and vector layers
4. Before/after hard-wipe comparison for temporal comparison
5. Grounded answer card
6. Acquisition dates used
7. Data-confidence indicator
8. Plan/evidence tape
9. Real export actions where implemented

The application should feel impressive within seconds of opening while remaining easy for a non-technical judge to understand.

## Loading states

Loading states must represent real execution:

* Planning
* AOI resolution
* Scene search
* Scene selection
* Raster processing
* Index calculation
* Change detection
* Semantic retrieval
* Verification
* Composition

Never fake progress.

## Errors

Errors must be specific and actionable.

Never show:

* "Oops"
* "Something went wrong"
* Generic unexplained 500 messages

Instead explain what failed, why, and what the user can do next.

## Responsive design

The UI must remain usable on smaller screens.

Respect keyboard focus and `prefers-reduced-motion`.

---

# 11. SEMANTIC SEARCH IS A DIFFERENTIATOR, NOT A FAKE FEATURE

Where implemented, semantic search must perform the real pipeline:

Natural-language text
→ SigLIP text embedding
→ vector retrieval over real indexed satellite tiles
→ ranked candidates
→ render real imagery for retrieved footprints
→ VLM verification where enabled
→ report similarity and verification honestly

Do not pretend keyword metadata search is semantic image search.

Do not label unverified retrieval results as confirmed real-world phenomena.

Use measured/calculated wording such as:

"High spectral and semantic similarity"

instead of making unsupported claims.

Calibrate demo concepts using the evaluation process defined in `SPEC.md`.

If a concept performs poorly, do not promote it in suggested demo queries.

---

# 12. TEST WITH THE CODE

Every task ships with tests.

For operations:

* Test against recorded real responses where upstream data is involved.
* Assert important numerical outputs, not merely object shape.
* Test error paths.
* Test validation.
* Test provenance where relevant.

Run the relevant acceptance command before claiming completion.

Run the application itself.

Use the browser surface.

Submit the real acceptance query.

Inspect the resulting UI.

Capture evidence of the completed run where required.

"It should work" is not evidence that it works.

---

# 13. CREDENTIAL AND SECRET BOUNDARY

Secrets must:

* Come from `.env`
* Be loaded through the approved configuration layer
* Never be hardcoded
* Never be committed
* Never be printed in logs
* Never be shown in screenshots

Missing credentials must fail loudly and specifically.

Do not silently switch to fake data or an invented fallback.

---

# 14. COST AND PERFORMANCE DISCIPLINE

Satellite processing requests consume resources.

Follow the request caps and caching rules in `SPEC.md`.

Requirements include:

* Cap raster requests as specified
* Cache deterministic requests by canonical SHA256 request identity
* Repeated requests should reuse cached artifacts
* Track processing consumption
* Preserve cache-hit information
* Keep the demo within the specified latency budget

Do not repeatedly call expensive services when a valid cached result exists.

---

# 15. OFFLINE DEMO MODE

The project must support the offline replay behaviour specified in `SPEC.md`.

Offline mode may replay only previously recorded real responses.

If an offline fixture is missing:

* Fail clearly.
* Do not synthesize a response.

The UI must visibly state that it is replaying a recorded run.

This mode is intended to protect the demo against poor venue connectivity, not to hide mocked data.

---

# 16. EVALUATION IS PART OF THE PRODUCT

Maintain the evaluation harness defined in `SPEC.md`.

Do not claim:

* Accuracy
* Precision
* Reliability
* Retrieval quality
* Performance

without measurement.

Run evaluations after significant changes.

Track relevant metrics such as:

* Plan validity
* Operation selection quality
* AOI resolution
* Numeric guard violations
* Retrieval quality where implemented
* End-to-end latency
* Cache effectiveness

The target for fabricated or unsupported numeric claims is zero.

Use the evaluation report as evidence during the SIH presentation.

---

# 17. ONE TASK PER RUN

For each coding run:

1. Read `TASKS.md`.
2. Select one ticket.
3. Confirm dependencies are available.
4. Implement only that ticket.
5. Write/update tests.
6. Run the ticket's acceptance command.
7. Run required repository checks.
8. Test through the real application surface.
9. Stop and report the result.

Do not opportunistically refactor unrelated systems.

Do not start three major subsystems at once.

A hackathon prototype benefits more from reliable completed vertical slices than from many half-finished features.

---

# 18. WHEN BLOCKED

Do not create a fake workaround.

Write a decision note under:

`docs/decisions/NNN-<slug>.md`

Include:

* The problem
* Evidence of the problem
* Available options
* Trade-offs
* Recommended option
* What is blocked

Then stop.

Do not silently replace a required API, model, architecture, or real data source.

---

# 19. REPOSITORY QUALITY RULES

Follow repository conventions from `SPEC.md`.

Requirements include:

* Type hints throughout Python
* Strict TypeScript
* No unexplained `any`
* No unexplained `# type: ignore`
* Typed exceptions
* No `except: pass`
* No hidden generic failures
* One operation per operation file
* Artifacts returned by path
* Provenance retained
* Tests beside implementation
* Only documented runtime dependencies

Before completion, check for prohibited placeholder/fabrication patterns.

---

# 20. DEFINITION OF DONE FOR A USER-FACING FEATURE

A feature is complete only when:

* It works from the natural-language query interface.
* It supports a real query from the evaluation set where applicable.
* Every displayed number traces back to deterministic evidence.
* Acquisition dates used are shown.
* Scene/cloud/data quality information is shown where applicable.
* Confidence is computed, not invented.
* Provenance is accessible.
* No-data conditions fail honestly and specifically.
* Required tests pass.
* Repository checks pass.
* No fake or dummy data reaches the UI.
* The feature has been tested through the browser.
* The UI is polished enough to demonstrate confidently to SIH judges.
* The README describes only functionality that actually runs.

---

# 21. THINGS THAT WILL GET A CHANGE REJECTED

Reject any change that:

* Adds a dashboard tile without an upstream operation
* Displays a number without evidence
* Uses fake data for a demo
* Generates confidence through an LLM
* Lets the LLM calculate measurements
* Lets the LLM execute arbitrary code
* Claims a phenomenon the system cannot actually measure
* Labels similarity as confirmation
* Hides poor-quality or unavailable satellite data
* Silently substitutes a fallback result
* Adds unnecessary distributed infrastructure
* Replaces the specified stack without a decision
* Claims a feature in documentation that does not run
* Creates a visually impressive UI using fabricated measurements
* Prioritizes appearance over data truth

The rule is:

**A beautiful interface with fake satellite results is a failed project.
A simpler interface with real, traceable evidence is always better.
The final goal is to achieve both: a visually impressive ground-station experience backed entirely by real, reproducible data.**

---

# FINAL PRIORITY ORDER

When instructions conflict, use this order:

1. Truth of displayed data
2. `SPEC.md` technical contract
3. Deterministic and reproducible measurement
4. Evidence and provenance
5. User-visible error honesty
6. End-to-end working implementation
7. SIH demo reliability
8. UI polish
9. Additional features

Never sacrifice items 1–7 merely to make the demo look more complete.

Build SatQuery AI as a system that can answer the judge's most important question:

**"Where did this number come from?"**

The answer must always be visible in the executed operations, evidence, provenance, real satellite scenes, acquisition dates, and deterministic calculations.
