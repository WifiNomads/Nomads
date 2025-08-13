# Wi‑Fi Airtime Calculator
---

## 1) Airtime Definition
Airtime is the **total time the medium is occupied** for a single PPDU exchange, including:
1. **Channel access delay** — AIFS/DIFS + average contention backoff slots.
2. **Optional protection sequences** — RTS/CTS.
3. **DATA PPDU** — PHY preamble + data symbols.
4. **ACK/BA exchange** — SIFS + acknowledgment PPDU.

The calculator supports two outputs:
- **Inclusive Airtime**: includes AIFS and average backoff.
- **Exclusive Airtime**: excludes contention delay.

---

## 2) Supported PHY/MAC Scenarios
1. **Non‑HT OFDM (802.11a/g)** — 20 MHz, 1 spatial stream, legacy OFDM modulation.
2. **HT/VHT (802.11n/ac)** — 20/40/80/160 MHz, 1–8 spatial streams, MCS0–9.
3. **HE SU (802.11ax)** — 20–160 MHz, 1–8 SS, MCS0–11, GI options 0.8/1.6/3.2 µs.
4. **HE DL OFDMA (802.11ax)** — RU sizes with per‑user subcarrier allocation.

Control frames (RTS, CTS, ACK, BA) are transmitted using **legacy OFDM** rates and **4 µs symbols** regardless of the data scenario.

---

## 3) Core PHY Parameters
**Symbol Duration (T_SYM)**:
- Non‑HT: 3.2 µs + 0.8 µs GI = **4.0 µs**.
- HT/VHT: 3.2 µs + GI (0.8 µs or 0.4 µs).
- HE: 12.8 µs + GI (0.8 µs / 1.6 µs / 3.2 µs).

**Data Subcarriers per 20 MHz**:
- Non‑HT: 48
- HT/VHT: 52 / 108 / 234 / 468
- HE SU: 234 / 468 / 980 / 1960

**RU Data Subcarriers (20 MHz)**:
- RU26: 24
- RU52: 48
- RU106: 96
- RU242: 234

**EDCA Timing Defaults**:
- SIFS: 16 µs (OFDM)
- Slot time: 9 µs (OFDM)
- AIFS = SIFS + AIFSN × Slot
- Expected Backoff = (CW / 2) × Slot

**A‑MPDU Length Limits**:
- HT: 65,535 B
- VHT: ~1 MiB
- HE: ~4 MiB

---

## 4) Bits per OFDM Symbol
For DATA:
```
DataBitsPerSymbol = DataSubcarriers × Nbpsc × R × Nss
```
Where:
- **Nbpsc**: bits per subcarrier (BPSK=1, QPSK=2, 16‑QAM=4, 64‑QAM=6, 256‑QAM=8, 1024‑QAM=10).
- **R**: code rate (e.g., 1/2, 3/4).
- **Nss**: number of spatial streams.

Control frames:
```
CtrlBitsPerSymbol = 48 × Nbpsc × R
```

---

## 5) Preamble Durations
- **Non‑HT**: 20 µs (L-STF + L-LTF + L-SIG)
- **HT**: 20 + 8 (HT‑SIG) + 4 (HT‑STF) + N_HT-LTF × 4 µs
- **VHT**: 20 + 8 (VHT‑SIG‑A) + 4 (VHT‑STF) + N_VHT-LTF × 4 + 4 (VHT‑SIG‑B)
- **HE SU**: 20 + 4 (RL‑SIG) + 8 (HE‑SIG‑A) + 4 (HE‑STF) + N_HE-LTF × 12.8 µs
- **HE OFDMA**: HE SU preamble + variable HE‑SIG‑B duration

---

## 6) Data Bits Calculation
```
TotalDataBits = SERVICE (16 b) + TAIL (6 b)
              + Σ(MPDU_length_bytes × 8)
```
Where:
```
MPDU_length_bytes = MAC_header + MSDU/AMSDU + FCS + Delimiter_if_A-MPDU
```
Defaults: MAC=30 B, FCS=4 B, delimiter=4 B (>1 MPDU).

Data symbols:
```
DataSymbols = ceil( TotalDataBits / DataBitsPerSymbol )
DataDuration = DataSymbols × T_SYM
```

---

## 7) Control Frame Duration
Example for ACK:
```
FrameBits = SERVICE + FrameBody_bits + TAIL
CtrlSymbols = ceil( FrameBits / CtrlBitsPerSymbol )
CtrlDuration = 20 µs preamble + CtrlSymbols × 4 µs
```

---

## 8) Total Airtime Formula
```
Total Airtime = AIFS + Expected Backoff
              + [RTS + SIFS + CTS + SIFS] (if enabled)
              + Data Preamble + Data Duration
              + SIFS + ACK/BA
```

---

## 9) Scenario Walk‑through Examples

### Example 1: Non‑HT OFDM, 54 Mb/s, 1500 B, RTS/CTS
- Data bits/sym: 48×6×3/4 = 216 b
- Payload + MAC + FCS = (1500+34)×8 = 12,272 b
- SERVICE+TAIL = +22 b → 12,294 b
- Symbols = ceil(12294/216) = 57
- DataDuration = 57×4 µs = 228 µs
- Data Preamble = 20 µs → DATA total = 248 µs
- RTS = 28 µs, CTS = 28 µs, ACK = 44 µs
- AIFS (BE) = 43 µs, Backoff = 67.5 µs
- **Total** = 490.5 µs, Throughput ≈ 24.5 Mb/s

### Example 2: HE SU, 80 MHz, MCS9, GI 0.8 µs, Nss=2
- Data subcarriers: 980
- Bits/sym per SS: 980×8×5/6 ≈ 6533.33
- Nss=2 → 13066.67 b/sym
- Data bits = 12,294 b → Symbols = 1
- T_SYM = 13.6 µs → DataDuration = 13.6 µs
- HE Preamble = 61.6 µs
- ACK (24 Mb/s legacy) = 44 µs
- Total excl. access = 119.2 µs

---

## 10) Engineering Notes
- MAC header size must match capture conditions (QoS, 4‑addr, encryption).
- HE‑SIG‑B duration is RU/user dependent — tool calculates exactly.
- CWmax can be up to 1023; default EDCA params vary per AC.
- Control rate must be in the BSS Basic Rate Set.

---

### Thank You.!!