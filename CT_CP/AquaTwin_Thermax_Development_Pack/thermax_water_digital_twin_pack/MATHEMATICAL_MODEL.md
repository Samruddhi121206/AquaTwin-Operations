# Mathematical Model & Control Theory

## 1. Purpose and modelling boundary

This document defines a first-principles reference model for:
- Raw-water tank level.
- Inlet/outlet flow.
- Pump and pipeline approximation.
- PID level or flow control.
- RO feed/permeate/reject mass balance.
- Basic water-quality indicators.

The equations are not a substitute for vendor pump curves, membrane projections, process design calculations or site commissioning. Use actual approved values when available.

## 2. Symbols and units

| Symbol | Meaning | SI unit |
|---|---|---|
| \(h\) | Liquid level | m |
| \(A\) | Tank cross-sectional area | m² |
| \(V\) | Liquid volume | m³ |
| \(Q_{in}\) | Inlet volumetric flow | m³/s |
| \(Q_{out}\) | Outlet volumetric flow | m³/s |
| \(Q_p\) | Pump flow | m³/s |
| \(g\) | Gravitational acceleration | m/s² |
| \(\rho\) | Fluid density | kg/m³ |
| \(p\) | Pressure | Pa |
| \(u\) | Control signal, 0–1 or 0–100% | dimensionless |
| \(K_p,K_i,K_d\) | PID gains | controller-dependent |
| \(C_f,C_p,C_r\) | Feed, permeate, reject concentration | mg/L or kg/m³ |
| \(Q_f,Q_{perm},Q_{rej}\) | RO feed, permeate, reject flow | m³/h |
| \(R\) | RO recovery | dimensionless |

Always convert all calculations to consistent units internally. The UI can display engineering units such as m³/h, bar and LPH.

## 3. Tank mass/volume balance

For a tank with approximately constant cross-sectional area:

\[
V(t)=A h(t)
\]

Conservation of volume:

\[
\frac{dV}{dt}=Q_{in}(t)-Q_{out}(t)
\]

Therefore:

\[
A\frac{dh(t)}{dt}=Q_{in}(t)-Q_{out}(t)
\]

or:

\[
\boxed{\frac{dh(t)}{dt}=\frac{Q_{in}(t)-Q_{out}(t)}{A}}
\]

For a tank with varying cross-section, use:

\[
\frac{dV}{dh}\frac{dh}{dt}=Q_{in}-Q_{out}
\]

### Discrete simulation update

For simulation time step \(\Delta t\):

\[
V_{k+1}=V_k+(Q_{in,k}-Q_{out,k})\Delta t
\]

\[
h_{k+1}=\frac{V_{k+1}}{A}
\]

Clamp the volume to physical bounds:

\[
0\leq V_{k+1}\leq V_{max}
\]

A numerical clamp is a simulation boundary, not a substitute for physical high-high/low-low protection.

### Example only

Assume a vertical cylindrical tank with diameter \(D=4\,m\), working height \(H=5\,m\).

\[
A=\frac{\pi D^2}{4}=12.566\,m^2
\]

\[
V_{max}=AH=62.83\,m^3
\]

If \(Q_{in}=10\,m^3/h\) and \(Q_{out}=6\,m^3/h\):

\[
\frac{dh}{dt}=\frac{4/3600}{12.566}=8.84\times10^{-5}\,m/s
\]

Equivalent level rise:

\[
\frac{dh}{dt}\times3600=0.318\,m/h
\]

These numbers are illustrative and must not be attributed to Thermax.

## 4. Pump and flow model

### 4.1 Simple virtual pump model

For an initial virtual model, approximate pump flow as a configured operating flow multiplied by a speed/control factor:

\[
Q_p=Q_{rated}\,u\,\eta_{availability}
\]

where:
- \(u\in[0,1]\) is the normalised speed or command.
- \(\eta_{availability}=1\) when available and \(0\) when stopped/tripped.
- A more accurate model must use the vendor pump curve and system curve.

### 4.2 Pump affinity laws

For geometrically similar operation at different rotational speed \(N\):

\[
\frac{Q_2}{Q_1}=\frac{N_2}{N_1}
\]

\[
\frac{H_2}{H_1}=\left(\frac{N_2}{N_1}\right)^2
\]

\[
\frac{P_2}{P_1}=\left(\frac{N_2}{N_1}\right)^3
\]

These are approximate affinity relationships. Use vendor limits and efficiency curves for engineering decisions.

### 4.3 System curve approximation

A simplified system head model:

\[
H_{sys}=H_{static}+KQ^2
\]

Actual operating point is the intersection of pump head curve and system curve. The simulation may use a calibrated polynomial pump curve:

\[
H_p(Q,N)=aN^2-bQ^2
\]

This is only a chosen mathematical approximation; coefficients must be fitted from the pump datasheet or test data.

## 5. Tank level control using PID

Define level error:

\[
e(t)=h_{sp}(t)-h(t)
\]

A parallel PID controller:

\[
u(t)=K_p e(t)+K_i\int_0^t e(\tau)d\tau+K_d\frac{de(t)}{dt}
\]

The output is limited:

\[
u_{min}\leq u(t)\leq u_{max}
\]

Implement anti-windup so the integral term does not continue accumulating while the actuator is saturated.

### Discrete PID

\[
I_k=I_{k-1}+K_i e_k\Delta t
\]

\[
D_k=K_d\frac{e_k-e_{k-1}}{\Delta t}
\]

\[
u_k=K_p e_k+I_k+D_k
\]

Then apply output limits and anti-windup correction.

**Control objective must be chosen from the real P&ID/control narrative.** The tank may be controlled by inlet valve, source pump, transfer pump, or a downstream demand strategy. Do not assume that the transfer pump is the level-control actuator.

### Transfer function of an ideal tank

If outlet flow is treated as a disturbance and inlet flow as the manipulated input:

\[
A\frac{dh}{dt}=Q_{in}-Q_{out}
\]

Taking Laplace transforms with zero initial condition:

\[
A s H(s)=Q_{in}(s)-Q_{out}(s)
\]

For \(Q_{out}=0\) as an isolated input-output derivation:

\[
\boxed{\frac{H(s)}{Q_{in}(s)}=\frac{1}{As}}
\]

This is an integrating process, not a self-regulating first-order tank model. If outlet flow depends on level, the transfer function changes.

## 6. RO mass balance

For a simplified RO unit at steady state:

\[
\boxed{Q_f=Q_{perm}+Q_{rej}}
\]

Recovery:

\[
\boxed{R=\frac{Q_{perm}}{Q_f}\times100\%}
\]

Reject fraction:

\[
R_{rej}=\frac{Q_{rej}}{Q_f}\times100\%
\]

For a two-stream salt balance:

\[
Q_f C_f=Q_{perm}C_{perm}+Q_{rej}C_{rej}
\]

Assuming consistent concentration units and negligible accumulation.

### Example only

If feed is 10 m³/h and permeate is 7 m³/h:

\[
Q_{rej}=10-7=3\,m^3/h
\]

\[
R=7/10\times100=70\%
\]

This is an arithmetic example, not a recommended operating target.

## 7. RO quality indicators

### Salt rejection

\[
\boxed{SR=\left(1-\frac{C_{perm}}{C_f}\right)\times100\%}
\]

Use conductivity as a practical proxy only where the plant's measurement method and conversion are understood. TDS and conductivity are not universally interchangeable by one fixed factor.

### Permeate flux

\[
J=\frac{Q_{perm}}{A_m}
\]

where \(A_m\) is effective membrane area. Ensure consistent time units.

### Specific energy consumption

\[
SEC=\frac{E_{electrical}}{V_{permeate}}
\]

Typical display unit: kWh/m³. Requires a defined energy meter boundary and volume measurement interval.

### Differential pressure

\[
\Delta P=P_{upstream}-P_{downstream}
\]

Trend it against flow, temperature and feed-water conditions. Do not infer fouling solely from one unnormalised pressure reading.

## 8. RO model limitations

A first release can implement:
- Feed/permeate/reject flow balance.
- Recovery.
- Salt rejection estimate.
- Simple pressure/flow trend placeholders.
- Configurable operating envelopes.

A high-fidelity membrane model requires:
- Membrane make/model and element count.
- Membrane area and staging.
- Feed-water composition and temperature.
- Feed pressure, osmotic pressure and recovery constraints.
- Concentration polarisation and fouling assumptions.
- Vendor projection software or validated performance curves.

Do not represent a simple mass-balance simulator as a predictive membrane design model.

## 9. Instrument measurement model

A simple sensor model:

\[
y_m(t)=y_{true}(t)+b+n(t)
\]

where:
- \(b\) = bias/offset.
- \(n(t)\) = measurement noise.

Add quality states:
- GOOD
- UNCERTAIN
- BAD
- STALE
- COMM_LOSS
- SIMULATED

A measurement should be represented as value + unit + timestamp + quality + source.

## 10. Alarm thresholds and hysteresis

For high alarm:
- Activate when \(x\geq SP_H\).
- Clear only when \(x\leq SP_H-\Delta\).

For low alarm:
- Activate when \(x\leq SP_L\).
- Clear only when \(x\geq SP_L+\Delta\).

\(\Delta\) is hysteresis. Values must be set by approved plant engineering documents. Alarm acknowledgement is separate from alarm return-to-normal.

## 11. Model calibration and validation

1. Confirm geometry and operating envelope.
2. Verify units and sensor scaling.
3. Compare tank level slope against measured inflow/outflow.
4. Compare pump flow/pressure with vendor curve or test data.
5. Compare RO mass balance using measured feed/permeate/reject.
6. Check recovery and water-quality calculations.
7. Run step tests and disturbance tests in simulation.
8. Record residual error and operating conditions.
9. Version the model parameters and approval.
10. Reject a model if residuals exceed the agreed engineering tolerance.

## 12. Required parameter register

| Parameter | Required source | Status until confirmed |
|---|---|---|
| Tank diameter / dimensions | Approved GA drawing | Assumed |
| Tank usable volume | Datasheet / GA | Assumed |
| Pump curve | Vendor datasheet | Assumed |
| Motor power | Motor datasheet | Assumed |
| Valve characteristic | Datasheet | Assumed |
| LT range and scaling | Instrument datasheet / I/O list | Assumed |
| RO capacity | Selected model datasheet | Configured after model selection |
| Membrane configuration | Approved RO design | Unavailable |
| RO pressure limits | Vendor / approved design | Unavailable |
| Quality limits | Process specification | Unavailable |
| PID gains | Commissioned control settings | Unavailable |

## 13. Mathematical acceptance tests

- Tank volume never becomes negative or exceeds configured maximum.
- Volume change equals integrated inflow minus outflow within numerical tolerance.
- RO mass-balance residual is within configured tolerance.
- Recovery is between 0% and 100% for valid positive flows.
- Zero feed flow does not produce divide-by-zero errors.
- Sensor bad/stale quality propagates to dashboard and alarm logic.
- PID output respects actuator limits.
- PID integral anti-windup is tested.
- Model outputs are deterministic for a fixed seed and input sequence.
