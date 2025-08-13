# Wi‑Fi Airtime Calculator

---

## 1) What “airtime” means

Airtime is the **wall‑clock transmit time** of one MAC exchange (data + required protocol overhead). It typically includes:

1. **Channel access**: AIFS/DIFS + random backoff (EDCA)
2. **Protection** *(optional)*: RTS/CTS exchange
3. **Data PPDU**: PHY preamble + DATA symbols
4. **Acknowledgment**: SIFS + ACK (or Block‑ACK) PPDU

The calculator can show **inclusive** (with AIFS/backoff) and **exclusive** (without them) durations.

---

## 2) Scenarios in the tool

- **Scenario 1 — Non‑HT OFDM (802.11a/g)**: 20 MHz, legacy OFDM rates (6…54 Mb/s), 1 spatial stream.
- **Scenario 2 — HT/VHT (802.11n/ac)**: 20/40/80/160 MHz, MIMO (1…8 SS), MCS0…9.
- **Scenario 3 — HE SU (802.11ax)**: Single‑user HE, 20…160 MHz, MCS0…11, GI 0.8/1.6/3.2 µs.
- **Scenario 4 — HE DL OFDMA (802.11ax)**: Multi‑user downlink using RUs; per‑user data subcarriers depend on RU size.

> **Note:** Control frames (RTS/CTS/ACK/BA) are typically sent at a **legacy OFDM base rate** with **4 µs symbols**; the Data PPDU uses the selected PHY/mode.

---

## 3) Core PHY constants

### 3.1 Symbol duration (Data portion)

- **Non‑HT OFDM (11a/g)**: `T_SYM = 4.0 µs` (3.2 µs useful + 0.8 µs GI)
- **HT/VHT (11n/ac)**: `T_SYM = 3.2 µs + GI` (GI = 0.8 or 0.4 µs)
- **HE (11ax)**: `T_SYM = 12.8 µs + GI` (GI = 0.8, 1.6, 3.2 µs)

### 3.2 Data subcarriers (per 20 MHz, **data tones only**; pilots excluded)

- **Non‑HT OFDM**: 48
- **HT/VHT**: 52 (20 MHz), 108 (40), 234 (80), 468 (160)
- **HE SU (full‑band)**: 234 (20 MHz), 468 (40), 980 (80), 1960 (160)

### 3.3 HE OFDMA — common RU sizes (20 MHz channel)

- **RU26** → **24 data** tones
- **RU52** → **48 data** tones
- **RU106** → **96 data** tones
- **RU242** → **234 data** tones

> Wider channels are internally partitioned into 20 MHz subchannels; the tool maps user‑selected RUs accordingly.

### 3.4 EDCA timings

- **SIFS**: 16 µs (OFDM bands), 10 µs (DSSS/2.4 GHz legacy)
- **Slot time**: 9 µs (OFDM)
- **DIFS** (legacy) = `SIFS + 2×slot`
- **AIFS** (EDCA) = `SIFS + AIFSN×slot` (AIFSN depends on AC: VO/VI=2, BE=3, BK=7)

### 3.5 Contention window (expected backoff)

For a uniform random integer in `[0, CW]`, the expected slots = `CW/2`.

- **E[Backoff]** = `(CW / 2) × slot_time`
- Typical defaults: aCWmin=15, aCWmax=1023 (AC‑dependent reductions apply for VO/VI)

### 3.6 Aggregation limits (A‑MPDU length)

- **HT (11n)**: max **65,535 B**
- **VHT (11ac)**: max **1,048,575 B** (\~1 MiB)
- **HE (11ax)**: max **4,194,303 B** (\~4 MiB)

The tool enforces the correct maximum based on the selected **Scenario**.

---

## 4) Bits‑per‑symbol

For a given MCS (modulation bits per subcarrier `Nbpsc` and coding rate `R`):

```
DataBitsPerSymbol = (DataSubcarriers) × Nbpsc × R × Nss
```

- **Scenario 1 (legacy OFDM)** uses `DataSubcarriers=48` and `Nss=1`.
- **HT/VHT** uses the table in §3.2 and user‑selected `Nss`.
- **HE SU** uses the HE data counts in §3.2 and `Nss`.
- **HE OFDMA** uses **RU data tones per user** from §3.3 and `Nss` per user.

> Control frames use **legacy OFDM modulation** (4 µs symbols) at the selected **Control Rate** (base rate list). Their bits‑per‑symbol is `48×Nbpsc×R`.

---

## 5) PPDU components

### 5.1 Data PPDU preamble (overview)

- **Non‑HT OFDM**: `20 µs` (L‑STF + L‑LTF + L‑SIG)
- **HT (11n)**: `20 µs (legacy) + 8 µs (HT‑SIG) + 4 µs (HT‑STF) + N_HT‑LTF×4 µs`
- **VHT (11ac)**: `20 µs (legacy) + 8 µs (VHT‑SIG‑A) + 4 µs (VHT‑STF) + N_VHT‑LTF×4 µs + 4 µs (VHT‑SIG‑B)`
- **HE (11ax, SU)**: `20 µs (legacy) + 4 µs (RL‑SIG) + 8 µs (HE‑SIG‑A) + 4 µs (HE‑STF) + N_HE‑LTF×12.8 µs`
- **HE (11ax, OFDMA)**: same as HE‑SU **plus** **HE‑SIG‑B** (variable length; depends on RU allocation/users). The calculator derives its duration from the encoded bit count and HE symbol timing.

> `N_*‑LTF` usually ≥ `Nss` (depends on spatial mapping/PPDU type). The calculator selects the appropriate count for your inputs.

### 5.2 Data payload bits in the DATA portion

For one A‑MPDU of `PayloadBytes` (application data), the PHY encodes:

```
TotalDataBits = SERVICE(16) + TAIL(6) + Sum_over_MPDU( MAC_Header + MSDU/AMSDU + FCS + [Delimiter_if_A‑MPDU] ) × 8
```

Defaults used by the tool unless otherwise specified:

- **MAC header**: 30 B (QoS Data typical; 24 B non‑QoS; 36 B 4‑addr)
- **FCS**: 4 B
- **A‑MPDU delimiter**: 4 B (if more than one MPDU)
- **SERVICE/TAIL**: 16 b / 6 b (added once per PPDU)

Then:

```
DataSymbols = ceil( TotalDataBits / DataBitsPerSymbol )
DataDuration = DataSymbols × T_SYM
```

### 5.3 Control frames (RTS/CTS/ACK/Block‑ACK)

- Frame bits (w/ SERVICE+TAIL):
  - RTS 20 B → 182 b
  - CTS 14 B → 134 b
  - ACK 14 B → 134 b
  - Block‑ACK 32 B → 278 b
- Duration at **Control Rate** (legacy OFDM):

```
CtrlBitsPerSym = 48×Nbpsc×R
CtrlSymbols = ceil(FrameBits / CtrlBitsPerSym)
CtrlDuration = 20 µs (legacy preamble) + CtrlSymbols × 4 µs
```

---

## 6) Channel access (EDCA)

- **AIFS** = `SIFS + AIFSN×slot`
- **E[Backoff]** = `(CW / 2) × slot`\
  (For BE with aCWmin=15: E[Backoff] = 7.5×9 µs = **67.5 µs**)

---

## 7) Putting it together — total airtime

```
Total Airtime = AIFS + E[Backoff]
              + [RTS preamble+RTS + SIFS + CTS preamble+CTS + SIFS]  (if enabled)
              + Data Preamble + DataDuration
              + SIFS + ACK preamble+ACK   (or Block‑ACK)
```

The calculator reports:

- **Inclusive** duration: includes AIFS + E[Backoff]
- **Exclusive** duration: excludes them (protocol timing only)

---

## 8) Worked example (exact numbers, Scenario 1)

**Goal:** Legacy OFDM @ 20 MHz, **54 Mb/s** data rate, **1500 B** payload, **BE** AC, **RTS/CTS enabled**, **Control Rate = 24 Mb/s**, 5 GHz (SIFS 16 µs, slot 9 µs).

**1) Channel access**\
AIFS = 16 + 3×9 = **43 µs**\
E[Backoff] = (15/2)×9 = **67.5 µs**

**2) Protection (legacy control rate 24 Mb/s)**\
Bits/symbol = 48×4×1/2 = **96 b/sym**\
RTS 182 b → ceil(182/96)=2 sym → **8 µs** + 20 µs preamble = **28 µs**\
CTS 134 b → ceil(134/96)=2 sym → **8 µs** + 20 µs preamble = **28 µs**\
SIFS + SIFS = **32 µs**\
**Protection total = 28 + 28 + 32 = 88 µs**

**3) Data PPDU (54 Mb/s)**\
Data bits/symbol = 48×6×3/4 = **216 b/sym**\
Payload + MAC(30 B) + FCS(4 B) = (1500+34)×8 = **12,272 b**\
Add SERVICE+TAIL = +22 → **12,294 b**\
Symbols = ceil(12,294/216) = **57**\
DataDuration = 57×4 µs = **228 µs**\
Preamble = **20 µs**\
**Data total = 248 µs**

**4) ACK (24 Mb/s)**\
ACK 134 b → 2 sym = **8 µs** + 20 µs preamble = **28 µs**\
SIFS = **16 µs**\
**ACK total = 44 µs**

**5) Grand total**\
`43 + 67.5 + 88 + 248 + 44 = 490.5 µs`

**Throughput**\
`(1500×8) / 490.5 ≈ 24.5 Mb/s`

> Change control rate or disable RTS/CTS to see the calculator adjust each term.

---

## 9) Notes & limitations

- Control frames are assumed **legacy OFDM** at the user‑selected **Control Rate**; some deployments enforce minimum basic rates.
- MAC header size can vary (QoS/4‑addr/security). The default of **30 B** is a practical modern assumption; change it in Advanced if you need exact parity with captures.
- HE preamble fields (especially **HE‑SIG‑B**) are variable; the calculator derives them from RU allocation and user count.
- Results assume ideal channels (no retries). Retransmissions add more DATA/ACK cycles and contention.

---

## 10) Quick reference

- **Symbol durations:** 4 µs (legacy), 3.2+GI µs (HT/VHT), 12.8+GI µs (HE)
- **Data tones (20 MHz):** 48 (legacy), 52 (HT/VHT), 234 (HE)
- **RU data tones (20 MHz):** 24 (RU26), 48 (RU52), 96 (RU106), 234 (RU242)
- **Backoff expectation:** (CW/2)×9 µs
- **A‑MPDU max:** 65,535 B (HT), \~1 MiB (VHT), \~4 MiB (HE)

---

*End of v2*

