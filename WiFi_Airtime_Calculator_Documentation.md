# Wi-Fi Airtime Calculator - Complete Guide

## Table of Contents
1. [What is Wi-Fi Airtime?](#what-is-Wi-Fi-airtime)
2. [Calculator Overview](#calculator-overview)
3. [The Four Scenarios](#the-four-scenarios)
4. [How to Use the Calculator](#how-to-use-the-calculator)
5. [Understanding the Parameters](#understanding-the-parameters)
6. [Calculations and Formulas](#calculations-and-formulas)
7. [Reading the Results](#reading-the-results)
8. [Practical Examples](#practical-examples)
9. [Technical Reference](#technical-reference)

---

## What is Wi-Fi Airtime?

When a device wants to transmit a frame, it's important to estimate the total time required for the transmission. This includes not only the actual data but also all protocol overhead—such as headers, acknowledgments, and mandatory timing intervals—defined by the IEEE 802.11 standards

### What's Included in Airtime
Every Wi-Fi transmission includes these components:
- **Channel Access**: Time spent waiting to transmit (DIFS/AIFS + Backoff)
- **Protection Frames**: Optional RTS/CTS handshake
- **Data Transmission**: Preamble + actual data payload
- **Acknowledgment**: ACK or Block-ACK response
- **Inter-Frame Spacing**: Required gaps between frames (SIFS)

---

## Calculator Overview

This calculator provides IEEE 802.11 standards-compliant airtime calculations for all major Wi-Fi generations, from legacy 802.11a/g through the latest Wi-Fi 6 (802.11ax) with OFDMA support.

### Key Features
- **Four Calculation Scenarios** covering all Wi-Fi generations
- **Complete Protocol Implementation** including all timing overhead
- **OFDMA Support** for Wi-Fi 6 multi-user transmissions
- **Interactive Results** with detailed timing breakdown charts
- **Professional Accuracy** based on official IEEE specifications

---

## The Four Scenarios

### Scenario 1: OFDM (non-HT) - Legacy 802.11a/g
**When to use**: Legacy devices, compatibility analysis
- Fixed 20 MHz bandwidth
- Single spatial stream only
- Data rates: 6, 9, 12, 18, 24, 36, 48, 54 Mbps
- 0.8 μs guard interval (fixed)
- 48 data subcarriers

### Scenario 2: HT or VHT - 802.11n/ac (Wi-Fi 4/5)
**When to use**: Modern Wi-Fi 4/5 deployments
- Bandwidth: 20/40/80/160 MHz
- Spatial streams: 1-8
- MCS 0-9 (no 1024-QAM)
- Guard interval: 0.4 μs or 0.8 μs
- Enhanced throughput with MIMO

### Scenario 3: HE (OFDMA disabled) - 802.11ax Single User (Wi-Fi 6)
**When to use**: Wi-Fi 6 single-user transmissions
- All bandwidth options available
- MCS 0-11 (includes 1024-QAM)
- Guard intervals: 0.8, 1.6, 3.2 μs
- Improved efficiency over VHT

### Scenario 4: DL OFDMA - 802.11ax Multi-User (Wi-Fi 6)
**When to use**: Wi-Fi 6 multi-user scenarios, high-density environments
- Multiple users transmit simultaneously
- Resource Unit (RU) based spectrum allocation
- Enhanced signaling overhead (HE-SIG-B)
- Coordinated multi-user transmissions

---

## How to Use the Calculator

### Step 1: Select Your Scenario
Choose the scenario that matches your Wi-Fi deployment:
- Legacy devices → Scenario 1
- Wi-Fi 4/5 → Scenario 2  
- Wi-Fi 6 single-user → Scenario 3
- Wi-Fi 6 multi-user → Scenario 4

### Step 2: Configure Basic Parameters
- **Band**: 2.4 GHz (up to 40 MHz) or 5 GHz (up to 160 MHz)
- **Bandwidth**: Channel width (20/40/80/160 MHz)
- **A-MPDU Size**: Data payload in bytes (typical: 1500 bytes)

### Step 3: Set Advanced Parameters
- **MCS/Data Rate**: Modulation scheme (higher = faster but needs better signal)
- **Spatial Streams**: Number of MIMO streams (1, 2, 4, 8)
- **Guard Interval**: Symbol protection time
- **Access Category**: Traffic priority (VO, VI, BE, BK)
- **RTS/CTS Protection**: Enable for hidden node protection

### Step 4: Calculate and Analyze
- Click "Calculate" to get results
- Review the timing breakdown table
- Analyze the airtime bar chart
- Compare different configurations

---

## Understanding the Parameters

### Channel Bandwidth
| Bandwidth | Subcarriers (Legacy) | Subcarriers (HT/VHT) | Subcarriers (HE) | Typical Use |
|-----------|---------------------|---------------------|------------------|-------------|
| 20 MHz    | 48                 | 52                  | 242             | Basic, crowded areas |
| 40 MHz    | -                  | 108                 | 484             | Moderate performance |
| 80 MHz    | -                  | 234                 | 980             | High performance |
| 160 MHz   | -                  | 468                 | 1960            | Maximum throughput |

### MCS (Modulation and Coding Scheme)
| MCS | Modulation | Coding Rate | Bits/Symbol | Signal Quality Needed |
|-----|------------|-------------|-------------|----------------------|
| 0   | BPSK       | 1/2         | 1           | Poor (-82 dBm)       |
| 1   | QPSK       | 1/2         | 2           | Fair (-79 dBm)       |
| 2   | QPSK       | 3/4         | 2           | Fair (-77 dBm)       |
| 3   | 16-QAM     | 1/2         | 4           | Good (-74 dBm)       |
| 4   | 16-QAM     | 3/4         | 4           | Good (-70 dBm)       |
| 5   | 64-QAM     | 2/3         | 6           | Very Good (-66 dBm)  |
| 6   | 64-QAM     | 3/4         | 6           | Very Good (-65 dBm)  |
| 7   | 64-QAM     | 5/6         | 6           | Excellent (-64 dBm)  |
| 8   | 256-QAM    | 3/4         | 8           | Excellent (-59 dBm)  |
| 9   | 256-QAM    | 5/6         | 8           | Excellent (-57 dBm)  |
| 10  | 1024-QAM   | 3/4         | 10          | Perfect (-54 dBm)    |
| 11  | 1024-QAM   | 5/6         | 10          | Perfect (-52 dBm)    |

### Access Categories (QoS)
| Category | AIFSN | CW Min-Max | Typical Use | Priority |
|----------|-------|------------|-------------|----------|
| VO (Voice) | 2   | 3-7        | VoIP calls  | Highest  |
| VI (Video) | 2   | 7-15       | Video streaming | High |
| BE (Best Effort) | 3 | 15-1023  | Web browsing | Normal |
| BK (Background) | 7 | 15-1023   | File transfers | Lowest |

### OFDMA Resource Units (Wi-Fi 6 Only)
| Bandwidth | Users | RU Type | Subcarriers/User | Efficiency |
|-----------|-------|---------|------------------|------------|
| 20 MHz    | 1     | RU242   | 242             | Single-user |
| 20 MHz    | 2     | RU106   | 106             | Good sharing |
| 20 MHz    | 4     | RU52    | 52              | High sharing |
| 20 MHz    | 9     | RU26    | 26              | Maximum sharing |
| 80 MHz    | 1     | RU980   | 980             | Single-user |
| 80 MHz    | 4     | RU242   | 242             | Balanced |
| 80 MHz    | 16    | RU52    | 52              | High density |

---

## Calculations and Formulas

### Basic Timing Parameters
```
SIFS = 16 μs (5 GHz) or 10 μs (2.4 GHz)
Slot Time = 9 μs
Legacy Preamble = 20 μs (L-STF + L-LTF + L-SIG)
```

### Inter-Frame Spacing
```
DIFS = SIFS + 2 × Slot Time = SIFS + 18 μs
AIFS = SIFS + AIFSN × Slot Time

Where AIFSN values:
- VO/VI: 2 → AIFS = SIFS + 18 μs
- BE: 3 → AIFS = SIFS + 27 μs  
- BK: 7 → AIFS = SIFS + 63 μs
```

### Backoff Time
```
Backoff Duration = Average_CW × Slot Time
```

### Preamble Durations

#### Legacy OFDM (Scenario 1)
```
Preamble Duration = 20 μs (fixed)
```

#### HT/VHT (Scenario 2)
```
Preamble Duration = Legacy_Preamble + HT-SIG + HT-STF + HT-LTF
                  = 20 + 8 + 4 + (4 × Spatial_Streams) μs
```

#### HE (Scenarios 3 & 4)
```
Preamble Duration = Legacy + RL-SIG + HE-SIG-A + HE-SIG-B + HE-STF + HE-LTF
                  = 20 + 4 + 8 + HE-SIG-B + 4 + (6.4 × Spatial_Streams) μs

For OFDMA (Scenario 4):
HE-SIG-B Duration = ceil(Signaling_Bits / 26) × 4 μs
Signaling_Bits = 8 × (Bandwidth/20) + 24 × Users
```

### Data Transmission

#### Symbol Duration
```
Legacy Symbol = 4 μs (fixed)
HT/VHT Symbol = 3.2 + Guard_Interval μs
HE Symbol = 12.8 + Guard_Interval μs
```

#### Data Rate Calculation
```
Data_Bits_per_Symbol = Subcarriers × MCS_Bits × Coding_Rate × Spatial_Streams

Total_Data_Bits = 16 + (A-MPDU_bytes × 8) + 6
                = SERVICE(16) + DATA + TAIL(6)

Data_Symbols = ceil(Total_Data_Bits / Data_Bits_per_Symbol)
Data_Duration = Data_Symbols × Symbol_Duration
```

#### Subcarrier Counts by Standard
```
Legacy (20 MHz only): 48 data subcarriers
HT/VHT: 20MHz→52, 40MHz→108, 80MHz→234, 160MHz→468
HE: 20MHz→242, 40MHz→484, 80MHz→980, 160MHz→1960
```

### Control Frames

#### Frame Sizes
```
RTS Frame: 20 bytes → 182 total bits (including SERVICE + TAIL)
CTS Frame: 14 bytes → 134 total bits
ACK Frame: 14 bytes → 134 total bits
Block-ACK: 32 bytes → 278 total bits
```

#### Control Frame Duration
```
Control_Bits_per_Symbol = 48 × MCS_Bits × Coding_Rate (legacy rates)
Control_Duration = ceil(Frame_Bits / Control_Bits_per_Symbol) × 4μs
```

### Complete Airtime Formula
```
Total_Airtime = AIFS + Backoff + Protection + Data_Transmission + ACK

Where:
Protection = RTS_Preamble + RTS + SIFS + CTS_Preamble + CTS + SIFS (if enabled)
Data_Transmission = Data_Preamble + Data_Duration
ACK = SIFS + ACK_Preamble + ACK_Duration
```

### Throughput Calculation
```
Throughput (Mbps) = (A-MPDU_bytes × 8) / (Total_Airtime_μs × 10^-6) / 10^6

Simplified:
Throughput = (A-MPDU_bytes × 8) / Total_Airtime_μs
```

---

## Reading the Results

### Results Table
The calculator provides two key measurements:

**Duration including DIFS & CW**
- Complete real-world transmission time
- Includes channel access overhead
- Best for capacity planning

**Duration excluding DIFS & CW**  
- Pure protocol transmission time
- Excludes random access delays
- Best for protocol efficiency analysis

### Airtime Breakdown Chart
The horizontal bar chart shows time spent in each phase:

**Channel Access (blue bars)**
- DIFS/AIFS: Inter-frame spacing
- Backoff: Random collision avoidance

**Protection (green bars, if enabled)**
- RTS Preamble + RTS Frame
- SIFS gap
- CTS Preamble + CTS Frame
- SIFS gap

**Data Transmission (orange bars)**
- Data Preamble: PHY signaling
- A-MPDU: Actual data payload

**Acknowledgment (red bars)**
- SIFS gap
- ACK Preamble + ACK/Block-ACK

### Interpreting Efficiency
- **Large data portion** = High efficiency
- **Large overhead portions** = Low efficiency, needs optimization
- **Long preambles** = Consider higher MCS if signal quality allows
- **Long protection** = Evaluate if RTS/CTS is necessary

---

## Practical Examples

### Example 1: Legacy Wi-Fi (Scenario 1)
**Configuration:**
- 20 MHz, 54 Mbps, 1500 bytes
- RTS/CTS enabled, BE access category

**Calculation Steps:**
1. **Channel Access**: AIFS(43μs) + Backoff(135μs) = 178μs
2. **Protection**: RTS(20+46μs) + SIFS(16μs) + CTS(20+34μs) + SIFS(16μs) = 152μs
3. **Data**: Preamble(20μs) + Data(288μs) = 308μs
4. **ACK**: SIFS(16μs) + ACK(20+34μs) = 70μs
5. **Total**: 708μs
6. **Throughput**: (1500×8) / 708 = 16.9 Mbps

### Example 2: Wi-Fi 6 Single User (Scenario 3)
**Configuration:**
- 80 MHz, MCS 7, 4 streams, 4000 bytes
- 0.8μs GI, no protection

**Calculation Steps:**
1. **Channel Access**: AIFS(43μs) + Backoff(135μs) = 178μs
2. **Data**: Preamble(58.6μs) + Data(61.6μs) = 120.2μs
3. **ACK**: SIFS(16μs) + Block-ACK(58.6+17.6μs) = 92.2μs
4. **Total**: 390.4μs
5. **Throughput**: (4000×8) / 390.4 = 82.0 Mbps

### Example 3: Wi-Fi 6 OFDMA (Scenario 4)
**Configuration:**
- 80 MHz, 4 users, MCS 5, 1500 bytes each
- 0.8μs GI, RU242 per user

**Calculation Steps:**
1. **Channel Access**: AIFS(43μs) + Backoff(135μs) = 178μs
2. **Data**: Preamble(74.6μs) + Data(83.2μs) = 157.8μs
3. **ACK**: SIFS(16μs) + Block-ACK(74.6+17.6μs) = 108.2μs
4. **Total per user**: 444.0μs
5. **Throughput per user**: (1500×8) / 444.0 = 27.0 Mbps
6. **Total system throughput**: 27.0 × 4 = 108.0 Mbps

---

## Technical Reference

### IEEE Standards Compliance
This calculator implements calculations according to:
- **IEEE 802.11-2020**: Main Wi-Fi standard
- **IEEE 802.11ax-2021**: Wi-Fi 6 specifications
- **IEEE 802.11ac-2013**: Wi-Fi 5 specifications
- **IEEE 802.11n-2009**: Wi-Fi 4 specifications

### Browser Compatibility
- Modern browsers with JavaScript enabled
- HTML5 Canvas support for charts
- Responsive design for mobile devices

### Accuracy Notes
- All timing values match IEEE specifications
- Calculations include complete protocol overhead
- Real-world performance may vary due to channel conditions
- Results represent ideal conditions without interference

### Limitations
- Does not account for channel errors or retransmissions
- Assumes ideal propagation conditions
- Multi-user coordination overhead is simplified
- Does not include higher layer protocol overhead

