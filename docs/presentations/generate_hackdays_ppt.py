import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# Color Palette: Deep Slate Navy, Emerald Green, Electric Cyan, Pure White, Light Slate
BG_COLOR = RGBColor(11, 19, 32)        # #0b1320
CARD_BG = RGBColor(19, 30, 49)         # #131e31
EMERALD = RGBColor(16, 185, 129)       # #10b981
CYAN = RGBColor(6, 182, 212)          # #06b6d4
WHITE = RGBColor(255, 255, 255)
LIGHT_GRAY = RGBColor(203, 213, 225)   # #cbd5e1
ACCENT_RED = RGBColor(239, 68, 68)     # #ef4444

def set_slide_background(slide):
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = BG_COLOR

def add_header(slide, title_text, category_text="HACKDAYS 2.0 | THEME: BEST USE OF GOOGLE GEMINI API"):
    # Header container
    tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(1.1))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    
    p_cat = tf.paragraphs[0]
    p_cat.text = category_text.upper()
    p_cat.font.size = Pt(11)
    p_cat.font.bold = True
    p_cat.font.color.rgb = CYAN
    
    p_title = tf.add_paragraph()
    p_title.text = title_text
    p_title.font.size = Pt(24)
    p_title.font.bold = True
    p_title.font.color.rgb = WHITE
    p_title.space_before = Pt(4)

def add_card(slide, left, top, width, height, bg_color=CARD_BG, border_color=CYAN):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = bg_color
    shape.line.color.rgb = border_color
    shape.line.width = Pt(1.5)
    return shape

# -------------------------------------------------------------
# SLIDE 1: Title Slide
# -------------------------------------------------------------
slide1 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide1)

card1 = add_card(slide1, Inches(1.0), Inches(0.8), Inches(11.333), Inches(5.9), bg_color=CARD_BG, border_color=EMERALD)

tb1 = slide1.shapes.add_textbox(Inches(1.5), Inches(1.2), Inches(10.333), Inches(5.0))
tf1 = tb1.text_frame
tf1.word_wrap = True

p1 = tf1.paragraphs[0]
p1.text = "HACKDAYS 2.0 — GCET GREATER NOIDA"
p1.font.size = Pt(13)
p1.font.bold = True
p1.font.color.rgb = CYAN

p2 = tf1.add_paragraph()
p2.text = "TerraGuard AI"
p2.font.size = Pt(40)
p2.font.bold = True
p2.font.color.rgb = WHITE
p2.space_before = Pt(8)

p3 = tf1.add_paragraph()
p3.text = "Multimodal Landslide Intelligence & Safe Evacuation Platform"
p3.font.size = Pt(22)
p3.font.bold = True
p3.font.color.rgb = EMERALD
p3.space_before = Pt(4)

p4 = tf1.add_paragraph()
p4.text = "Theme: Best Use of Google Gemini API  |  Multimodal Vision + Function Calling + Long-Context Reasoning"
p4.font.size = Pt(14)
p4.font.color.rgb = LIGHT_GRAY
p4.space_before = Pt(16)

p5 = tf1.add_paragraph()
p5.text = "Team: Brain_ece\nMembers: Kartik Sonawane, Nishita Devi, Vaishnavi Pimparkar\nCollege: Sanjivani College of Engineering, Kopargaon\nLive App: https://terraguard-ai-fawn.vercel.app  |  GitHub: github.com/SKartik03/terraguard-ai"
p5.font.size = Pt(13)
p5.font.color.rgb = LIGHT_GRAY
p5.space_before = Pt(24)

# -------------------------------------------------------------
# SLIDE 2: Problem Statement
# -------------------------------------------------------------
slide2 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide2)
add_header(slide2, "The Problem: Climate Extremes & Deadly Slope Failures")

# Box 1: The Crisis
c1 = add_card(slide2, Inches(0.8), Inches(1.7), Inches(3.7), Inches(5.2), border_color=ACCENT_RED)
tb = slide2.shapes.add_textbox(Inches(1.0), Inches(1.9), Inches(3.3), Inches(4.8))
tf = tb.text_frame
tf.word_wrap = True
tf.paragraphs[0].text = "ACUTE CLIMATE CRISIS"
tf.paragraphs[0].font.size = Pt(14)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = ACCENT_RED

p = tf.add_paragraph()
p.text = "• 65 Million People in India live across 0.42M km² of high-hazard terrain (Western Ghats & Himalayas).\n\n• Cloudburst Intensification: Extreme monsoon downpours rapidly oversaturate slopes, triggering deadly flash debris flows (e.g. 350+ casualties in 2024 Wayanad disaster).\n\n• Lifeline Infrastructure Severed: National highways (NH-66, NH-58) cut off, stranding thousands."
p.font.size = Pt(12)
p.font.color.rgb = LIGHT_GRAY
p.space_before = Pt(10)

# Box 2: Existing Gaps
c2 = add_card(slide2, Inches(4.8), Inches(1.7), Inches(3.7), Inches(5.2), border_color=CYAN)
tb = slide2.shapes.add_textbox(Inches(5.0), Inches(1.9), Inches(3.3), Inches(4.8))
tf = tb.text_frame
tf.word_wrap = True
tf.paragraphs[0].text = "CURRENT SYSTEM GAPS"
tf.paragraphs[0].font.size = Pt(14)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = CYAN

p = tf.add_paragraph()
p.text = "• Coarse District Alerts: Generic rainfall bulletins cover 500+ km² indiscriminately without micro-topographical slope context, causing severe false alarm fatigue.\n\n• Static Hazard Maps: Existing GSI/ISRO atlases are static and do not adapt to live weather.\n\n• No Evacuation Support: Systems stop at red alerts without giving actionable, terrain-aware escape corridors."
p.font.size = Pt(12)
p.font.color.rgb = LIGHT_GRAY
p.space_before = Pt(10)

# Box 3: Opportunity
c3 = add_card(slide2, Inches(8.8), Inches(1.7), Inches(3.7), Inches(5.2), border_color=EMERALD)
tb = slide2.shapes.add_textbox(Inches(9.0), Inches(1.9), Inches(3.3), Inches(4.8))
tf = tb.text_frame
tf.word_wrap = True
tf.paragraphs[0].text = "OUR VISION"
tf.paragraphs[0].font.size = Pt(14)
tf.paragraphs[0].font.bold = True
tf.paragraphs[0].font.color.rgb = EMERALD

p = tf.add_paragraph()
p.text = "• Location-First AI Engine: Instant assessment anywhere in India using GPS, interactive GIS map, or search.\n\n• Multimodal Geotechnical AI: Leveraging Google Gemini 1.5 to visually analyze slope cracks and orchestrate telemetry tools.\n\n• Actionable Evacuation: Active pathfinding comparing safe high-ridge crests vs debris-blocked valleys."
p.font.size = Pt(12)
p.font.color.rgb = LIGHT_GRAY
p.space_before = Pt(10)

# -------------------------------------------------------------
# SLIDE 3: Solution Architecture - Google Gemini Core
# -------------------------------------------------------------
slide3 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide3)
add_header(slide3, "Proposed Solution: TerraGuard AI Powered by Google Gemini")

features = [
    ("1. Multimodal Vision Inspection", "Gemini 1.5 Vision processes drone surveys, satellite imagery, and on-ground citizen photos to identify tension cracks, crown scarps, and structural retaining wall failures.", CYAN),
    ("2. Agentic Tool Use & Function Calling", "Gemini acts as an autonomous disaster reasoning agent, dynamically executing tools like calculate_dem_slope(), query_historical_landslides(), and compute_evacuation_corridors().", EMERALD),
    ("3. Long-Context Historical Grounding", "Gemini ingests 165 verified historical landslide archives (ISRO/GSI benchmarks) within its massive context window for zero-hallucination analog matching.", CYAN),
    ("4. Polyglot Civil Defense Dispatches", "Generates hyper-local early warning broadcasts in regional languages (Hindi, Malayalam, Bengali, Pahari) tailored for grassroots residents and NDRF commanders.", EMERALD)
]

for idx, (ftitle, fdesc, fcolor) in enumerate(features):
    top_pos = Inches(1.7 + idx * 1.3)
    c = add_card(slide3, Inches(0.8), top_pos, Inches(11.7), Inches(1.15), border_color=fcolor)
    tb = slide3.shapes.add_textbox(Inches(1.0), top_pos + Inches(0.1), Inches(11.3), Inches(0.95))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = ftitle
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = fcolor
    p2 = tf.add_paragraph()
    p2.text = fdesc
    p2.font.size = Pt(12)
    p2.font.color.rgb = LIGHT_GRAY
    p2.space_before = Pt(3)

# -------------------------------------------------------------
# SLIDE 4: Gemini Technical Workflow
# -------------------------------------------------------------
slide4 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide4)
add_header(slide4, "How Google Gemini API Powers the Core Decision Matrix")

steps = [
    ("Step 1: Input Ingestion", "• User GPS / Map Selection\n• Live Open-Meteo Weather\n• Drone / Camera Slope Photos\n• NASA SRTM DEM Gradients", CYAN),
    ("Step 2: Gemini 1.5 Flash/Pro", "• Multimodal Image Analysis\n• Function Calling & Orchestration\n• Geotechnical Safety Factor\n• Historical Context Cross-check", EMERALD),
    ("Step 3: Analytical Engine", "• Layer 1: Rule Safety Net\n• Dynamic Weight Renormalization\n• Layer 2: Random Forest ML\n• Elevation Gradient Derivation", CYAN),
    ("Step 4: Actionable Output", "• 0-100 Gauge Risk Score\n• Safe High-Ridge Evacuation Path\n• Factor-by-Factor Explainability\n• Multilingual SMS/Radio Dispatch", EMERALD)
]

for idx, (stitle, sdesc, scolor) in enumerate(steps):
    left_pos = Inches(0.8 + idx * 2.95)
    c = add_card(slide4, left_pos, Inches(1.7), Inches(2.85), Inches(5.2), border_color=scolor)
    tb = slide4.shapes.add_textbox(left_pos + Inches(0.15), Inches(1.9), Inches(2.55), Inches(4.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = stitle
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = scolor
    p2 = tf.add_paragraph()
    p2.text = sdesc
    p2.font.size = Pt(12)
    p2.font.color.rgb = LIGHT_GRAY
    p2.space_before = Pt(10)

# -------------------------------------------------------------
# SLIDE 5: Geotechnical AI Engine & Dynamic Renormalization
# -------------------------------------------------------------
slide5 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide5)
add_header(slide5, "The Science: Mohr-Coulomb Dynamics & Dual-Layer Risk Engine")

c1 = add_card(slide5, Inches(0.8), Inches(1.7), Inches(5.7), Inches(5.2), border_color=CYAN)
tb1 = slide5.shapes.add_textbox(Inches(1.0), Inches(1.9), Inches(5.3), Inches(4.8))
tf1 = tb1.text_frame
tf1.word_wrap = True
tf1.paragraphs[0].text = "GEOTECHNICAL PRINCIPLES & MATH"
tf1.paragraphs[0].font.size = Pt(15)
tf1.paragraphs[0].font.bold = True
tf1.paragraphs[0].font.color.rgb = CYAN

p = tf1.add_paragraph()
p.text = "• Mohr-Coulomb Failure Dynamics: Shear strength τ_f = c' + (σ - u)·tan(φ'). Intense rainfall elevates pore pressure (u), diminishing effective stress until catastrophic slope failure occurs.\n\n• Dynamic Weight Renormalization:\n  w_i' = w_i / Σ(w_avail) × 100%\n  When cloud-cover blocks optical satellites (e.g. Sentinel-2 NDVI), remaining factor weights dynamically scale to 100%, preventing artificial score deflation.\n\n• Real-Time DEM Slope Gradients:\n  Computes arctan(Δz / Δd) per coordinate dynamically without heavy GIS servers."
p.font.size = Pt(12)
p.font.color.rgb = LIGHT_GRAY
p.space_before = Pt(8)

c2 = add_card(slide5, Inches(6.8), Inches(1.7), Inches(5.7), Inches(5.2), border_color=EMERALD)
tb2 = slide5.shapes.add_textbox(Inches(7.0), Inches(1.9), Inches(5.3), Inches(4.8))
tf2 = tb2.text_frame
tf2.word_wrap = True
tf2.paragraphs[0].text = "DUAL-LAYER RISK FUSION"
tf2.paragraphs[0].font.size = Pt(15)
tf2.paragraphs[0].font.bold = True
tf2.paragraphs[0].font.color.rgb = EMERALD

p = tf2.add_paragraph()
p.text = "• Deterministic Layer 1 Safety Net:\n  Rigid geotechnical safety rules calculate a normalized physics baseline with zero drift and 100% auditability.\n\n• Empirical Layer 2 Machine Learning:\n  120-tree Random Forest Classifier trained on 165 verified historical landslide incidents (2012–2026).\n\n• Benchmark Performance:\n  - 100% Accuracy & 1.00 ROC-AUC on holdout test calibration (n=33)\n  - Feature Importances: Rainfall (34.97%), Soil Moisture (26.24%), Vegetation (20.77%), Land Cover (10.28%), Slope (6.16%)."
p.font.size = Pt(12)
p.font.color.rgb = LIGHT_GRAY
p.space_before = Pt(8)

# -------------------------------------------------------------
# SLIDE 6: Dynamic Safe Evacuation Corridor Routing
# -------------------------------------------------------------
slide6 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide6)
add_header(slide6, "Beyond Prediction: Dynamic Safe Evacuation Pathfinding")

c1 = add_card(slide6, Inches(0.8), Inches(1.7), Inches(5.7), Inches(5.2), border_color=EMERALD)
tb1 = slide6.shapes.add_textbox(Inches(1.0), Inches(1.9), Inches(5.3), Inches(4.8))
tf1 = tb1.text_frame
tf1.word_wrap = True
tf1.paragraphs[0].text = "ROUTE A: HIGH RIDGE CREST BYPASS (RECOMMENDED)"
tf1.paragraphs[0].font.size = Pt(14)
tf1.paragraphs[0].font.bold = True
tf1.paragraphs[0].font.color.rgb = EMERALD

p = tf1.add_paragraph()
p.text = "• Hazard Score: 18% (LOW HAZARD)\n• Topographical Path: Trajectory follows stable granitic ridge spurs elevated well above alluvial drainage channels.\n• Clearance: 100% unimpeded clearance to designated community shelter.\n• Dynamic Origin Adaptation: Calculates customized hazard-avoidance routes from any user map-click coordinate."
p.font.size = Pt(12)
p.font.color.rgb = LIGHT_GRAY
p.space_before = Pt(10)

c2 = add_card(slide6, Inches(6.8), Inches(1.7), Inches(5.7), Inches(5.2), border_color=ACCENT_RED)
tb2 = slide6.shapes.add_textbox(Inches(7.0), Inches(1.9), Inches(5.3), Inches(4.8))
tf2 = tb2.text_frame
tf2.word_wrap = True
tf2.paragraphs[0].text = "ROUTE B: VALLEY ROADWAY (BLOCKED / IMPASSABLE)"
tf2.paragraphs[0].font.size = Pt(14)
tf2.paragraphs[0].font.bold = True
tf2.paragraphs[0].font.color.rgb = ACCENT_RED

p = tf2.add_paragraph()
p.text = "• Hazard Score: 94% (CRITICAL HAZARD)\n• Topographical Path: Traverses active monsoonal torrent ravine with severe debris-damming risk.\n• Status: BLOCKED at km 2.4 choke-point.\n• Gemini Integration: Gemini generates instantaneous police dispatch directives and road closure advisories to divert incoming civilian traffic."
p.font.size = Pt(12)
p.font.color.rgb = LIGHT_GRAY
p.space_before = Pt(10)

# -------------------------------------------------------------
# SLIDE 7: Live Prototype & Deployed Architecture
# -------------------------------------------------------------
slide7 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide7)
add_header(slide7, "Full-Stack Implementation & Live Cloud Deployment")

cards = [
    ("Production Frontend (Vercel)", "• React 18, Vite 6, Custom Dark Glassmorphism\n• Leaflet GIS & OpenStreetMap interactive mapping\n• Chart.js multi-factor sensitivity radar & curves\n• Live URL: https://terraguard-ai-fawn.vercel.app", CYAN),
    ("Production Backend (Render)", "• Python FastAPI ASGI service on Linux cloud\n• SQLite 3 WAL Mode with 165 historical records\n• Asynchronous background telemetry scheduler (180s)\n• Live API: https://terraguard-ai-ew30.onrender.com", EMERALD),
    ("14 Geospatial Integrations", "• NASA SRTM 30m DEM & ISRO Bhuvan Cartosat\n• IMD Pune Gridded Precipitation & Open-Meteo Live\n• ESA Sentinel-2 NDVI & NASA SMAP Soil Moisture\n• GSI Bhukosh & ISRO Landslide Atlas benchmarks", CYAN),
    ("Zero-Cloud Local Resilience", "• Self-contained offline fallback capability\n• Runs locally via start_backend.bat & start_frontend.bat\n• 17 automated Pytest suites passing (100% verification)", EMERALD)
]

for idx, (ctitle, cdesc, ccolor) in enumerate(cards):
    r = idx // 2
    c_idx = idx % 2
    left = Inches(0.8 + c_idx * 5.95)
    top = Inches(1.7 + r * 2.65)
    c = add_card(slide7, left, top, Inches(5.75), Inches(2.45), border_color=ccolor)
    tb = slide7.shapes.add_textbox(left + Inches(0.2), top + Inches(0.15), Inches(5.35), Inches(2.15))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = ctitle
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = ccolor
    p2 = tf.add_paragraph()
    p2.text = cdesc
    p2.font.size = Pt(12)
    p2.font.color.rgb = LIGHT_GRAY
    p2.space_before = Pt(6)

# -------------------------------------------------------------
# SLIDE 8: Multilingual Gemini Alerting & Explainability
# -------------------------------------------------------------
slide8 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide8)
add_header(slide8, "Multilingual Civil Broadcasts & Transparent Explainability")

c1 = add_card(slide8, Inches(0.8), Inches(1.7), Inches(5.7), Inches(5.2), border_color=CYAN)
tb1 = slide8.shapes.add_textbox(Inches(1.0), Inches(1.9), Inches(5.3), Inches(4.8))
tf1 = tb1.text_frame
tf1.word_wrap = True
tf1.paragraphs[0].text = "GEMINI MULTILINGUAL DISPATCHES"
tf1.paragraphs[0].font.size = Pt(14)
tf1.paragraphs[0].font.bold = True
tf1.paragraphs[0].font.color.rgb = CYAN

p = tf1.add_paragraph()
p.text = "• Breaking Language Barriers: Gemini translates and synthesizes technical geotechnical scores into culturally accessible emergency alerts across Indian vernaculars:\n  - Hindi: 'चेतावनी: भारी बारिश के कारण व्याथिरी घाट पर भूस्खलन का उच्च जोखिम...'\n  - Malayalam: 'മുന്നറിയിപ്പ്: കനത്ത മഴയെത്തുടർന്ന് മേപ്പാടി മേഖലയിൽ മണ്ണിടിച്ചിൽ സാധ്യത...'\n  - Bengali & Pahari regional dialects.\n\n• Multi-Tier Early Warning: Automatically formats actionable SMS, WhatsApp dispatches, and community loudspeaker broadcast scripts."
p.font.size = Pt(12)
p.font.color.rgb = LIGHT_GRAY
p.space_before = Pt(10)

c2 = add_card(slide8, Inches(6.8), Inches(1.7), Inches(5.7), Inches(5.2), border_color=EMERALD)
tb2 = slide8.shapes.add_textbox(Inches(7.0), Inches(1.9), Inches(5.3), Inches(4.8))
tf2 = tb2.text_frame
tf2.word_wrap = True
tf2.paragraphs[0].text = "EXPLAINABILITY vs BLACK-BOX"
tf2.paragraphs[0].font.size = Pt(14)
tf2.paragraphs[0].font.bold = True
tf2.paragraphs[0].font.color.rgb = EMERALD

p = tf2.add_paragraph()
p.text = "• Factor-by-Factor Audit Trail: Shows exact score points contributed by rainfall, slope angle, regolith saturation, and bedrock condition.\n\n• Deterministic Reproducibility: Re-evaluating identical conditions guarantees identical scores to one decimal place (e.g. 58.1/100 Moderate).\n\n• Gemini Technical Auditor: Officials can converse directly with Gemini to ask: 'Why is Route B flagged critical?' and receive instant physics-backed explanations."
p.font.size = Pt(12)
p.font.color.rgb = LIGHT_GRAY
p.space_before = Pt(10)

# -------------------------------------------------------------
# SLIDE 9: Hackathon Offline Round Execution Plan
# -------------------------------------------------------------
slide9 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide9)
add_header(slide9, "Offline Hackathon Execution Plan at GCET (26 Sep 2026)")

milestones = [
    ("Phase 1: Online Screening (Current)", "• Full-stack production app deployed (Vercel + Render)\n• 165 historical landslide incidents calibrated\n• Dynamic slope derivation & routing live", CYAN),
    ("Phase 2: Offline Day - Gemini Live Drone Feed", "• Connect Gemini 1.5 Pro multimodal vision to live drone/video camera stream\n• Real-time automated crack detection & scarpline polygon extraction", EMERALD),
    ("Phase 3: Offline Day - Voice Interaction & Audio", "• Gemini voice conversational agent for emergency command centers\n• Voice-activated situational inquiries ('Check Wayanad ridge status')", CYAN),
    ("Phase 4: Offline Judging Demonstration", "• Table-to-table live scenario simulation (Wayanad monsoon vs Kopargaon)\n• Strict deterministic verification + live mobile responsiveness", EMERALD)
]

for idx, (mtitle, mdesc, mcolor) in enumerate(milestones):
    top_pos = Inches(1.7 + idx * 1.3)
    c = add_card(slide9, Inches(0.8), top_pos, Inches(11.7), Inches(1.15), border_color=mcolor)
    tb = slide9.shapes.add_textbox(Inches(1.0), top_pos + Inches(0.1), Inches(11.3), Inches(0.95))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = mtitle
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = mcolor
    p2 = tf.add_paragraph()
    p2.text = mdesc
    p2.font.size = Pt(12)
    p2.font.color.rgb = LIGHT_GRAY
    p2.space_before = Pt(3)

# -------------------------------------------------------------
# SLIDE 10: Conclusion & Why TerraGuard Wins
# -------------------------------------------------------------
slide10 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_background(slide10)
add_header(slide10, "Why TerraGuard AI Exemplifies 'Best Use of Gemini API'")

reasons = [
    ("1. Genuine Multimodal Impact", "Not another text wrapper or simple chatbot—leverages Gemini 1.5 Vision, Function Calling, and Long Context to solve a critical, life-threatening disaster problem in India.", CYAN),
    ("2. Real Working Full-Stack Architecture", "Already deployed and tested live on Vercel and Render with zero-cloud local fallback and 17 passing automated test suites.", EMERALD),
    ("3. Geotechnical Rigor & Explainability", "Combines deterministic Mohr-Coulomb slope physics with Random Forest ML, validated on 165 real historical Indian landslides.", CYAN),
    ("4. Ready for Offline Grand Finale", "Clear execution roadmap for 26 September at GCET with live drone feed integration and conversational Gemini voice commander.", EMERALD)
]

for idx, (rtitle, rdesc, rcolor) in enumerate(reasons):
    top_pos = Inches(1.7 + idx * 1.3)
    c = add_card(slide10, Inches(0.8), top_pos, Inches(11.7), Inches(1.15), border_color=rcolor)
    tb = slide10.shapes.add_textbox(Inches(1.0), top_pos + Inches(0.1), Inches(11.3), Inches(0.95))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = rtitle
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = rcolor
    p2 = tf.add_paragraph()
    p2.text = rdesc
    p2.font.size = Pt(12)
    p2.font.color.rgb = LIGHT_GRAY
    p2.space_before = Pt(3)

output_pptx = r"C:\Users\Admin\OneDrive\Desktop\HackDays_2.0_TerraGuard_Gemini.pptx"
prs.save(output_pptx)
print("PPTX saved successfully:", output_pptx)
