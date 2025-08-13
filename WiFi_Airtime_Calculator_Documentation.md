# Wi‑Fi Airtime Calculator — Final Guide (v3)
---

## 1) What is Airtime?

Airtime is the **total transmission time** on the medium for a single data exchange, typically including:

1. **Channel access delay**: AIFS/DIFS + average random backoff
2. **Optional protection**: RTS/CTS handshakes
3. **Data PPDU**: PHY preamble + data symbols
4. **Acknowledgment**: SIFS + ACK or Block‑ACK

The calculator can output:

- **Inclusive airtime** (includes access delay)
- **Exclusive airtime** (excludes access delay)

---

## 2) Supported Scenarios

- **Scenario 1:** Non‑HT OFDM (802.11a/g)
- **Scenario 2:** HT/VHT (802.11n/ac)
- **Scenario 3:** HE SU (802.11ax)
- **Scenario 4:** HE DL OFDMA (802.11ax)

All control frames are sent at a **legacy OFDM base rate** with 4 µs symbols.

---

## 3) PHY Parameters

**Symbol durations:**

- Non‑HT: 4.0 µs (3.2 + 0.8 GI)
- HT/VHT: 3.2 µs + GI (0.8 or 0.4)
- HE: 12.8 µs + GI (0.8, 1.6, 3.2)

**Data subcarriers (20 MHz):**

- Non‑HT: 48
- HT/VHT: 52 (20), 108 (40), 234 (80), 468 (160)
- HE SU: 234 (20), 468 (40), 980 (80), 1960 (160)

**HE OFDMA RU data subcarriers (20 MHz):**

- RU26: 24
- RU52: 48
- RU106: 96
- RU242: 234

**EDCA timings:**

- SIFS: 16 µs (OFDM)
- Slot time: 9 µs (OFDM)
- AIFS = SIFS + AIFSN × Slot
- Expected backoff = (CW/2) × Slot

**Aggregation limits:**

- HT: 65,535 B
- VHT: \~1 MiB
- HE: \~4 MiB

---

## 4) Bits per Symbol

```
DataBitsPerSymbol = DataSubcarriers × Nbpsc × R × Nss
```

Control frames use legacy OFDM: `48 × Nbpsc × R`.

---

## 5) PPDU Components

**Preamble durations:**

- Non‑HT: 20 µs
- HT: 20 µs + 8 µs (HT‑SIG) + 4 µs (HT‑STF) + N\_HT‑LTF×4 µs
- VHT: 20 µs + 8 µs (VHT‑SIG‑A) + 4 µs (VHT‑STF) + N\_VHT‑LTF×4 µs + 4 µs (VHT‑SIG‑B)
- HE SU: 20 µs + 4 µs (RL‑SIG) + 8 µs (HE‑SIG‑A) + 4 µs (HE‑STF) + N\_HE‑LTF×12.8 µs
- HE OFDMA: HE SU preamble + variable HE‑SIG‑B length

**Data bits calculation:**

```
TotalDataBits = 16 + 6 + Σ(MAC + MSDU + FCS + Delimiter) × 8
```

Defaults: MAC 30 B, FCS 4 B, delimiter 4 B (if >1 MPDU)

**Control frame bits:**

- RTS: 182 b
- CTS: 134 b
- ACK: 134 b
- BA: 278 b Duration = 20 µs preamble + ceil(bits / CtrlBitsPerSym) × 4 µs

---

## 6) Channel Access

```
AIFS = SIFS + AIFSN × Slot
Expected Backoff = (CW / 2) × Slot
```

---

## 7) Total Airtime Formula

```
Total Airtime = AIFS + Expected Backoff
              + [RTS + SIFS + CTS + SIFS] (if enabled)
              + Data Preamble + Data Duration
              + SIFS + ACK/BA
```

---

## 8) Example — Non‑HT OFDM (Scenario 1)

Setup: 20 MHz, 54 Mb/s, payload 1500 B, BE, RTS/CTS, control rate 24 Mb/s

- AIFS = 43 µs
- Backoff = 67.5 µs
- RTS = 28 µs, CTS = 28 µs, SIFS×2 = 32 µs → 88 µs total
- Data bits/symbol = 216, total bits = 12,294, symbols = 57, duration = 228 µs + 20 µs preamble = 248 µs
- ACK = 44 µs **Total airtime** = 490.5 µs **Throughput** ≈ 24.5 Mb/s

---

## 9) Key Notes

- Control rate must be valid for the band
- MAC header size varies by frame type
- HE‑SIG‑B length depends on RU and user count
- No retransmissions assumed

---

## 10) Quick Reference

- Symbol durations: 4 µs (legacy), 3.2+GI µs (HT/VHT), 12.8+GI µs (HE)
- Data tones (20 MHz): 48 (legacy), 52 (HT/VHT), 234 (HE)
- RU tones (20 MHz): 24, 48, 96, 234
- Backoff = (CW/2) × 9 µs
- Max A‑MPDU: 65,535 B (HT), \~1 MiB (VHT), \~4 MiB (HE)

