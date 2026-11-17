// Fixed 20-question PE Power diagnostic (original questions).
//
// This file contains the ANSWER KEY. Only import it from server code
// (route handlers and server components). Client components receive
// the stripped-down `PublicQuestion` type instead.
//
// References name the topic area of the NCEES PE Power Reference Handbook
// and specific 2020 NEC sections. Handbook section names are general;
// check them against your own copy of the handbook.

export const QUESTION_SET_VERSION = 'v1-2026-11'

export const TOPICS = [
  'Circuit Analysis',
  'Rotating Machines',
  'Electric Power Devices',
  'Power System Analysis',
  'Protection',
  'Measurement & Instrumentation',
  'Codes & Standards',
] as const

export type Topic = (typeof TOPICS)[number]

export interface DiagnosticQuestion {
  id: string
  topic: Topic
  prompt: string
  choices: string[]
  answerIndex: number
  explanation: string
  reference: string
}

// What the browser is allowed to see during the exam.
export type PublicQuestion = Pick<DiagnosticQuestion, 'id' | 'topic' | 'prompt' | 'choices'>

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // ---------------- Circuit Analysis (3) ----------------
  {
    id: 'cir-1',
    topic: 'Circuit Analysis',
    prompt:
      'A balanced three-phase, wye-connected load has a per-phase impedance of 10∠30° Ω and is supplied at 480 V line-to-line. The total real power drawn by the load is most nearly:',
    choices: ['11.5 kW', '20.0 kW', '23.0 kW', '59.9 kW'],
    answerIndex: 1,
    explanation:
      'Phase voltage = 480/√3 = 277 V. In a wye, line current = phase current = 277/10 = 27.7 A. P = √3 × 480 × 27.7 × cos 30° ≈ 19.95 kW. 23.0 is the apparent power (kVA); 59.9 kW comes from wrongly putting 480 V across each impedance (treating it as a delta).',
    reference: 'Handbook: Three-phase circuits (balanced wye/delta power relationships)',
  },
  {
    id: 'cir-2',
    topic: 'Circuit Analysis',
    prompt:
      'A plant load is 500 kW at 0.80 power factor lagging. The capacitor bank needed to raise the power factor to 0.95 lagging is most nearly:',
    choices: ['164 kvar', '211 kvar', '300 kvar', '375 kvar'],
    answerIndex: 1,
    explanation:
      'Q before = 500 × tan(cos⁻¹ 0.80) = 500 × 0.750 = 375 kvar. Q after = 500 × tan(cos⁻¹ 0.95) = 500 × 0.329 = 164 kvar. Capacitor kvar = 375 − 164 ≈ 211 kvar. 375 and 164 are the before and after values, not the difference.',
    reference: 'Handbook: AC power (complex power, power factor correction)',
  },
  {
    id: 'cir-3',
    topic: 'Circuit Analysis',
    prompt:
      'A 240 V, 60 Hz single-phase source supplies a series load with R = 4 Ω and XL = 3 Ω. The real power delivered to the load is most nearly:',
    choices: ['6.9 kW', '9.2 kW', '11.5 kW', '14.4 kW'],
    answerIndex: 1,
    explanation:
      '|Z| = √(4² + 3²) = 5 Ω, so I = 240/5 = 48 A. P = I²R = 48² × 4 ≈ 9.2 kW. 11.5 is the apparent power (V × I, in kVA), 6.9 is the reactive power I²X (in kvar), and 14.4 kW ignores the reactance (V²/R).',
    reference: 'Handbook: AC circuits (impedance, real/reactive/apparent power)',
  },

  // ---------------- Rotating Machines (3) ----------------
  {
    id: 'rot-1',
    topic: 'Rotating Machines',
    prompt:
      'A 4-pole, 60 Hz three-phase induction motor runs at 1,746 rpm at full load. The frequency of the rotor currents is most nearly:',
    choices: ['1.8 Hz', '3.0 Hz', '58.2 Hz', '60 Hz'],
    answerIndex: 0,
    explanation:
      'Synchronous speed = 120f/P = 120 × 60/4 = 1,800 rpm. Slip s = (1,800 − 1,746)/1,800 = 0.03. Rotor frequency = s × f = 0.03 × 60 = 1.8 Hz. 60 Hz is the stator frequency; 3.0 is the slip in percent, not hertz.',
    reference: 'Handbook: Induction machines (synchronous speed, slip, rotor frequency)',
  },
  {
    id: 'rot-2',
    topic: 'Rotating Machines',
    prompt:
      'An induction motor is started at 80% of rated voltage using a reduced-voltage starter. Compared with full-voltage (across-the-line) starting, the starting torque is approximately:',
    choices: ['51%', '64%', '80%', '89%'],
    answerIndex: 1,
    explanation:
      'Induction motor torque is proportional to the square of applied voltage: (0.80)² = 0.64, so about 64%. Starting current falls roughly in proportion to voltage (about 80%), which is why 80% is a common wrong answer.',
    reference: 'Handbook: Induction machines (torque–voltage relationship, starting methods)',
  },
  {
    id: 'rot-3',
    topic: 'Rotating Machines',
    prompt:
      'A synchronous motor on an infinite bus is operated over-excited while its mechanical load stays constant. Which statement is correct?',
    choices: [
      'It runs above synchronous speed',
      'It operates at a leading power factor and supplies reactive power to the system',
      'It absorbs reactive power from the system at a lagging power factor',
      'Its real-power input drops to zero',
    ],
    answerIndex: 1,
    explanation:
      'Speed stays at synchronous regardless of excitation. Raising field current above the unity-PF level makes the internal EMF larger than terminal voltage, so armature current leads and the machine supplies vars, behaving like a capacitor (the synchronous condenser effect). Under-excitation gives a lagging PF. Real power is set by the mechanical load, not the field.',
    reference: 'Handbook: Synchronous machines (V-curves, excitation and power factor)',
  },

  // ---------------- Electric Power Devices (3) ----------------
  {
    id: 'dev-1',
    topic: 'Electric Power Devices',
    prompt:
      'A 1,500 kVA, 12.47 kV – 480Y/277 V transformer has an impedance of 5.75%. Assuming an infinite source, the available three-phase bolted fault current at the secondary terminals is most nearly:',
    choices: ['1.8 kA', '18.1 kA', '31.4 kA', '54.3 kA'],
    answerIndex: 2,
    explanation:
      'Secondary full-load current = 1,500,000 / (√3 × 480) ≈ 1,804 A. With an infinite source, fault current = FLA / Z(pu) = 1,804 / 0.0575 ≈ 31.4 kA. 1.8 kA is just the full-load current; 18.1 and 54.3 come from dividing or multiplying by √3 an extra time.',
    reference: 'Handbook: Transformers (percent impedance) and short-circuit calculations',
  },
  {
    id: 'dev-2',
    topic: 'Electric Power Devices',
    prompt:
      'An ideal 7,200/240 V single-phase transformer supplies a 2 Ω resistive load on its secondary. The load resistance referred to the primary side is:',
    choices: ['0.0022 Ω', '2 Ω', '60 Ω', '1,800 Ω'],
    answerIndex: 3,
    explanation:
      'Turns ratio a = 7,200/240 = 30. Impedance referred to the high side = a² × Z = 900 × 2 = 1,800 Ω. 60 Ω uses a instead of a², and 0.0022 Ω refers the impedance the wrong way.',
    reference: 'Handbook: Transformers (ideal transformer, referring impedances)',
  },
  {
    id: 'dev-3',
    topic: 'Electric Power Devices',
    prompt:
      'A 100 kVA transformer has a core loss of 500 W and a full-load copper loss of 1,200 W. Its efficiency at half load and unity power factor is most nearly:',
    choices: ['96.7%', '97.7%', '98.4%', '99.0%'],
    answerIndex: 2,
    explanation:
      'Output = 0.5 × 100 = 50 kW. Core loss is constant at 500 W; copper loss scales with load squared: 1,200 × 0.5² = 300 W. Efficiency = 50 / (50 + 0.8) ≈ 98.4%. 96.7% uses full-load copper loss, and 99.0% ignores copper loss.',
    reference: 'Handbook: Transformers (losses and efficiency)',
  },

  // ---------------- Power System Analysis (3) ----------------
  {
    id: 'psa-1',
    topic: 'Power System Analysis',
    prompt:
      "A generator's subtransient reactance is 0.08 per unit on its own 50 MVA, 13.8 kV rating. On a system base of 100 MVA and 13.8 kV, its reactance is:",
    choices: ['0.04 pu', '0.08 pu', '0.16 pu', '0.32 pu'],
    answerIndex: 2,
    explanation:
      'Z_new = Z_old × (S_new / S_old) × (V_old / V_new)² = 0.08 × (100/50) × 1 = 0.16 pu. Per-unit impedance goes up with a larger MVA base; 0.04 comes from inverting the MVA ratio.',
    reference: 'Handbook: Per-unit system (change of base)',
  },
  {
    id: 'psa-2',
    topic: 'Power System Analysis',
    prompt:
      'A 480 V three-phase feeder carries 200 A at 0.85 power factor lagging. Each conductor has R = 0.05 Ω and X = 0.04 Ω. Using the approximate voltage-drop formula, the drop as a percentage of 480 V is most nearly:',
    choices: ['2.6%', '3.1%', '4.6%', '5.3%'],
    answerIndex: 2,
    explanation:
      'Line-to-neutral drop ≈ I(R cos θ + X sin θ) = 200 × (0.05 × 0.85 + 0.04 × 0.527) ≈ 12.7 V. Line-to-line = √3 × 12.7 ≈ 22.0 V, which is 4.6% of 480 V. 2.6% forgets the √3, 3.1% ignores reactance, and 5.3% uses the single-phase factor of 2.',
    reference: 'Handbook: Transmission and distribution (voltage drop, approximate formula)',
  },
  {
    id: 'psa-3',
    topic: 'Power System Analysis',
    prompt:
      'For a bolted single-line-to-ground fault, the sequence impedances at the fault point are Z1 = Z2 = j0.10 pu and Z0 = j0.20 pu, with 1.0 pu prefault voltage. The magnitude of the fault current is:',
    choices: ['2.5 pu', '5.0 pu', '7.5 pu', '10.0 pu'],
    answerIndex: 2,
    explanation:
      'For an SLG fault the sequence networks are in series: I1 = I2 = I0 = 1.0 / (0.10 + 0.10 + 0.20) = 2.5 pu. Phase current Ia = 3 × I0 = 7.5 pu. 2.5 is a single sequence current; 10.0 is the three-phase fault current (1/Z1).',
    reference: 'Handbook: Symmetrical components and unsymmetrical faults',
  },

  // ---------------- Protection (3) ----------------
  {
    id: 'prot-1',
    topic: 'Protection',
    prompt:
      'An overcurrent relay is connected to a 600:5 CT and has a pickup setting of 5 A (secondary). For a primary fault current of 4,800 A, the relay operates at a multiple of pickup of:',
    choices: ['0.125', '6.7', '8', '40'],
    answerIndex: 2,
    explanation:
      'CT ratio = 600/5 = 120. Secondary current = 4,800 / 120 = 40 A. Multiple of pickup = 40 / 5 = 8. You read this multiple on the relay time–current curve to get the operating time. 40 is the secondary current itself.',
    reference: 'Handbook: Protective relaying (CT ratios, time-overcurrent relays)',
  },
  {
    id: 'prot-2',
    topic: 'Protection',
    prompt:
      'Transformer differential (87T) relays commonly use second-harmonic restraint. Its main purpose is to:',
    choices: [
      'Prevent tripping on magnetizing inrush when the transformer is energized',
      'Increase sensitivity to turn-to-turn faults',
      'Compensate for the phase shift of a delta–wye transformer',
      'Detect overloads above nameplate rating',
    ],
    answerIndex: 0,
    explanation:
      'Inrush current flows into only one winding, so it looks like differential (internal-fault) current. Inrush is rich in second harmonic and fault current is not, so the relay uses it to block or restrain. Phase-shift compensation is a separate setting (CT connections or internal compensation), and differential relays do not provide overload protection.',
    reference: 'Handbook: Protective relaying (transformer differential protection)',
  },
  {
    id: 'prot-3',
    topic: 'Protection',
    prompt:
      'In a radial system with several overcurrent devices in series, selective coordination means that for a fault:',
    choices: [
      'All upstream devices trip together to clear the fault as fast as possible',
      'Only the device nearest the fault on its source side opens, with upstream devices as time-delayed backup',
      'The main breaker always opens first to protect the source',
      'The device with the largest rating opens first',
    ],
    answerIndex: 1,
    explanation:
      'Selective coordination isolates the fault with the least loss of service: the closest upstream device clears it, and each device further upstream waits a coordination time margin before acting as backup. The NEC defines the term in Article 100 and requires it for emergency and legally required standby systems.',
    reference: 'NEC 2020: Article 100 (Coordination, Selective); 700.32; 701.32',
  },

  // ---------------- Measurement & Instrumentation (2) ----------------
  {
    id: 'meas-1',
    topic: 'Measurement & Instrumentation',
    prompt:
      'Two wattmeters measure a balanced three-phase load (two-wattmeter method). They read W1 = 8 kW and W2 = 4 kW. The load power factor is most nearly:',
    choices: ['0.333', '0.500', '0.707', '0.866'],
    answerIndex: 3,
    explanation:
      'tan θ = √3 (W1 − W2) / (W1 + W2) = 1.732 × 4 / 12 = 0.577, so θ = 30° and PF = cos 30° ≈ 0.866. Total power is W1 + W2 = 12 kW. 0.333 is just (W1 − W2)/(W1 + W2) without the √3.',
    reference: 'Handbook: Measurement (three-phase power measurement, two-wattmeter method)',
  },
  {
    id: 'meas-2',
    topic: 'Measurement & Instrumentation',
    prompt:
      'A single-phase wattmeter is connected through a 14,400:120 V potential transformer and a 400:5 A current transformer. The wattmeter reads 500 W. The primary power is:',
    choices: ['40 kW', '60 kW', '480 kW', '4.8 MW'],
    answerIndex: 3,
    explanation:
      'PT ratio = 120, CT ratio = 80. Primary power = 500 W × 120 × 80 = 4.8 MW. Applying only one of the ratios gives 40 kW (CT only) or 60 kW (PT only).',
    reference: 'Handbook: Measurement (instrument transformers, meter multipliers)',
  },

  // ---------------- Codes & Standards (3) ----------------
  {
    id: 'code-1',
    topic: 'Codes & Standards',
    prompt:
      'A 50 hp, 460 V, three-phase, Design B squirrel-cage motor uses an inverse-time circuit breaker for branch-circuit short-circuit and ground-fault protection. Using the 2020 NEC (and the next-standard-size-up allowance), the maximum breaker rating permitted is:',
    choices: ['80 A', '150 A', '175 A', '200 A'],
    answerIndex: 2,
    explanation:
      'Use the table FLC, not the nameplate: Table 430.250 gives 65 A. Table 430.52 allows 250% for an inverse-time breaker: 2.5 × 65 = 162.5 A. That is not a standard size, so 430.52(C)(1) Exception No. 1 allows the next higher standard size from 240.6(A), which is 175 A. 150 A is allowed but is not the maximum; 80 A is the 125% conductor-sizing value.',
    reference: 'NEC 2020: 430.6(A)(1); Table 430.250; 430.52(C)(1) and Table 430.52; 240.6(A)',
  },
  {
    id: 'code-2',
    topic: 'Codes & Standards',
    prompt:
      'A feeder supplies 80 A of continuous load and no noncontinuous load. Before any adjustment or correction factors, the minimum conductor ampacity required by the 2020 NEC is:',
    choices: ['64 A', '80 A', '100 A', '125 A'],
    answerIndex: 2,
    explanation:
      'Feeder conductors must have an ampacity of at least 100% of the noncontinuous load plus 125% of the continuous load: 1.25 × 80 = 100 A. (Branch circuits follow the same rule in 210.19(A)(1).) 64 A wrongly uses 80% instead of 125%.',
    reference: 'NEC 2020: 215.2(A)(1); 210.19(A)(1); Article 100 (Continuous Load)',
  },
  {
    id: 'code-3',
    topic: 'Codes & Standards',
    prompt:
      'Per the 2020 NEC, the minimum copper equipment grounding conductor for a circuit protected by a 400 A overcurrent device is:',
    choices: ['6 AWG', '4 AWG', '3 AWG', '1/0 AWG'],
    answerIndex: 2,
    explanation:
      'Table 250.122 sizes the EGC by the rating of the overcurrent device ahead of it: 400 A requires 3 AWG copper (1 AWG aluminum). If the ungrounded conductors are upsized for voltage drop, 250.122(B) requires the EGC to be increased proportionally.',
    reference: 'NEC 2020: 250.122 and Table 250.122',
  },
]

export function toPublicQuestions(): PublicQuestion[] {
  return DIAGNOSTIC_QUESTIONS.map(({ id, topic, prompt, choices }) => ({ id, topic, prompt, choices }))
}
