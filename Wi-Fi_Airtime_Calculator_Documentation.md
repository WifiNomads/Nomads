# Wi-Fi Airtime Calculator: A Deep Dive

Welcome to the official documentation for the Wi-Fi Airtime Calculator. This guide is designed to provide a clear, comprehensive understanding of how Wi-Fi airtime is calculated, the underlying technologies, and how to interpret the results from this tool.

## Part 1: What is Wi-Fi Airtime?

In the world of wireless networking, **airtime** is the measure of the total time a Wi-Fi channel is busy transmitting data. Think of a shared radio channel as a single-lane road. Airtime is the amount of time a car (a data packet) spends on that road, making it unavailable for other cars.

Efficiently managing airtime is crucial for a high-performing Wi-Fi network. Too much time spent on transmissions, especially inefficient ones, leads to congestion, slower speeds, and a poor user experience for everyone connected.

This calculator helps you visualize and quantify the airtime consumed by a single Wi-Fi transmission sequence, giving you insight into network efficiency.

## Part 2: The Anatomy of a Wi-Fi Transmission

A single Wi-Fi data transmission is more than just the data itself. It's a structured exchange with several components, each consuming a piece of the total airtime.

### Channel Access Delay
Before a device can transmit, it must wait for the channel to be free. This involves:

- **AIFS/DIFS**: A mandatory waiting period (Inter-Frame Space) to ensure the previous transmission is complete.
- **Backoff (Contention Window)**: A randomized waiting period to avoid collisions with other devices trying to speak at the same time.

### Protection Frames (Optional)
In busy environments, devices use a handshake to reserve the channel:

- **RTS (Request to Send)**: A small frame sent by the transmitter to ask for permission to send data.
- **CTS (Clear to Send)**: A reply from the receiver, telling all other devices to remain quiet.

### The Data Packet (PPDU)
This is the core of the transmission:

- **PHY Preamble**: A sequence at the start of the packet that synchronizes the transmitter and receiver. Its length and complexity vary by Wi-Fi standard.
- **Data Symbols**: The actual application data (e.g., website content, video stream) encoded into radio symbols for transmission.

### Acknowledgment (ACK)
After receiving the data, the receiver sends a confirmation:

- **SIFS (Shortest Inter-Frame Space)**: A very brief, high-priority waiting period.
- **ACK or Block ACK (BA)**: The acknowledgment frame itself. A Block ACK is more efficient as it can acknowledge multiple packets at once.

This entire sequence is what the calculator measures to determine the total airtime.

## Part 3: Supported Wi-Fi Technologies (The Scenarios)

The calculator supports four key generations of Wi-Fi technology, each with different characteristics:

### Scenario 1: OFDM (802.11a/g - "Legacy Wi-Fi")
- The foundation of modern Wi-Fi. It's reliable but less efficient than newer standards.
- Operates on a single 20 MHz channel with one spatial stream.

### Scenario 2: HT/VHT (802.11n/ac - "High Throughput / Very High Throughput")
- Introduced major speed enhancements like wider channels (up to 160 MHz) and multiple spatial streams (MIMO), allowing devices to send more data simultaneously.

### Scenario 3: HE SU (802.11ax - "High Efficiency / Wi-Fi 6")
- Focused on efficiency in dense environments. It uses a much longer symbol duration, which makes transmissions more robust and reliable, especially over longer distances.

### Scenario 4: HE DL OFDMA (802.11ax - "High Efficiency / Wi-Fi 6 Multi-User")
- The game-changer of Wi-Fi 6. OFDMA allows a single transmission to be subdivided and sent to multiple users at the same time, dramatically reducing overhead and waiting times.

## Part 4: Guide to Input Parameters

Here's a detailed look at each input in the calculator and its impact on performance.

### Channel Bandwidth
The width of the radio channel.

- **Impact**: Wider channels (e.g., 80 MHz vs 20 MHz) have more subcarriers, allowing for significantly higher data rates.
- **Trade-off**: Wider channels are more susceptible to interference and are less available in crowded Wi-Fi environments.

### Access Category (AC)
The priority level of the traffic.

- **Impact**: High-priority traffic like Voice (VO) uses a shorter AIFS waiting period, allowing it to transmit faster than Best Effort (BE) or Background (BK) traffic.
- **Trade-off**: Prioritizing one type of traffic necessarily means de-prioritizing another.

### Contention Window (CW)
The range for the random backoff timer.

- **Impact**: A smaller CW reduces the average waiting time but increases the probability of collisions in a busy network.
- **Trade-off**: Networks dynamically adjust the CW. A low value is good for quiet networks, while a high value is necessary for busy ones to avoid constant collisions.

### Spatial Streams (SS)
The number of simultaneous radio streams transmitted.

- **Impact**: Each spatial stream acts as a separate data pipe, multiplying the data rate. 2 streams are twice as fast as 1.
- **Trade-off**: Requires more advanced antennas on both the transmitter and receiver (e.g., 2x2, 4x4) and a clean radio environment.

### Guard Interval (GI)
A brief pause between data symbols to prevent interference.

- **Impact**: A shorter GI (e.g., 0.4 µs) reduces overhead and increases throughput.
- **Trade-off**: A short GI is less resilient to radio echoes (multipath) and is best used in environments with a clear line of sight. Longer GIs are more robust.

### MCS (Modulation and Coding Scheme)
An index that defines the modulation type and coding rate.

- **Impact**: Higher MCS values use more complex modulation (like 1024-QAM) to pack more bits into each symbol, resulting in higher data rates.
- **Trade-off**: Higher MCS rates require a very strong and clear signal (high SNR). They are very sensitive to distance and interference.

### MPDU/A-MPDU Bytes
The size of the data payload.

- **Impact**: Larger packets are more efficient because the fixed overhead (preamble, SIFS, etc.) is spread over more data. Sending one 8000-byte packet is far more efficient than sending two 4000-byte packets.
- **Trade-off**: A larger packet is more likely to get corrupted, forcing a retransmission of the entire large packet.

## Part 5: The Core Formulas

Here's how the calculator uses the parameters to determine airtime.

### Symbol Duration (T_SYM)

- **Non‑HT (Legacy)**: 3.2 µs (data) + 0.8 µs (Guard Interval) = 4.0 µs
- **HT/VHT**: 3.2 µs (data) + GI (0.4 or 0.8 µs)
- **HE (Wi-Fi 6)**: 12.8 µs (data) + GI (0.8, 1.6, or 3.2 µs)

### Data Subcarriers

| Bandwidth | Non-HT | HT/VHT | HE (Wi-Fi 6) |
|-----------|--------|--------|--------------|
| 20 MHz    | 48     | 52     | 242          |
| 40 MHz    | N/A    | 108    | 484          |
| 80 MHz    | N/A    | 234    | 980          |
| 160 MHz   | N/A    | 468    | 1960         |

### Bits per OFDM Symbol

```
DataBitsPerSymbol = DataSubcarriers × Nbpsc × R × Nss
```

Where:
- **Nbpsc**: Number of bits per subcarrier (depends on modulation)
- **R**: Coding rate
- **Nss**: Number of spatial streams

### Preamble Duration Formulas

#### Non‑HT (Legacy - 802.11a/g)
```
Preamble = L-STF (8 µs) + L-LTF (8 µs) + L-SIG (4 µs) = 20 µs
```

#### HT/VHT (802.11n/ac)
```
Preamble = Non-HT Preamble (20 µs) + HT-SIG (8 µs) + HT-STF (4 µs) + (HT-LTFs × 4 µs)
         = 36 µs + (Nss × 4 µs)
```
*Note: Nss is the number of spatial streams.*

#### HE SU (Wi-Fi 6 - 802.11ax)
```
Preamble = L-Preamble (20 µs) + RL-SIG (4 µs) + HE-SIG-A (8 µs) + HE-STF (4 µs) + (HE-LTFs × (3.2 µs + GI))
```
*Note: The number of HE-LTFs depends on the number of spatial streams and the selected LTF size.*

#### HE OFDMA (Wi-Fi 6 Multi-User)
```
Preamble = HE SU Preamble + HE-SIG-B Duration
```
*Note: The HE-SIG-B duration is variable and calculated based on the number of users and their resource unit (RU) allocation.*

### Total Airtime Formula

The total airtime is the sum of all individual components in the transmission sequence. The complete formula is:

```
Total Airtime = (AIFS + Backoff)
              + [RTS_Duration + SIFS + CTS_Duration + SIFS] (if protection is enabled)
              + (Data_Preamble_Duration + Data_Duration)
              + (SIFS + ACK/BA_Preamble_Duration + ACK/BA_Duration)
```

## Part 6: Practical Calculation Examples

Let's walk through two examples to see how this comes together.

### Example 1: Legacy Wi-Fi (802.11g)

**Scenario**: OFDM, 20 MHz, 54 Mbps data rate, 1500-byte packet.

1. **Channel Access**: DIFS (28 µs) + Backoff (avg. 67.5 µs) = 95.5 µs

2. **Data Packet**:
   - Preamble = 20 µs
   - Data Bits per Symbol = 216
   - Total Data Bits to Send = (1500 bytes × 8) + overhead = 12,294 bits
   - Symbols Needed = ceil(12294 / 216) = 57 symbols
   - Data Duration = 57 symbols × 4.0 µs/symbol = 228 µs

3. **Acknowledgment**: SIFS (10 µs) + ACK Preamble (20 µs) + ACK Duration (24 µs) = 54 µs

4. **Total Airtime**: 95.5 + 20 + 228 + 54 = **397.5 µs**

5. **Throughput**: (1500 × 8) / (397.5 × 10⁻⁶) = **30.2 Mbps**

### Example 2: Wi-Fi 6 (802.11ax)

**Scenario**: HE SU, 80 MHz, 2 Spatial Streams, MCS 9, 0.8 µs GI, 8000-byte packet.

1. **Channel Access**: AIFS (34 µs) + Backoff (avg. 67.5 µs) = 101.5 µs

2. **Data Packet**:
   - Preamble = 61.6 µs
   - Data Bits per Symbol = 13067
   - Total Data Bits to Send = (8000 bytes × 8) + overhead = 64,294 bits
   - Symbols Needed = ceil(64294 / 13067) = 5 symbols
   - Symbol Duration = 12.8 + 0.8 = 13.6 µs
   - Data Duration = 5 symbols × 13.6 µs/symbol = 68 µs

3. **Acknowledgment**: SIFS (16 µs) + Block ACK (using HE preamble) = 77.6 µs

4. **Total Airtime**: 101.5 + 61.6 + 68 + 77.6 = **308.7 µs**

5. **Throughput**: (8000 × 8) / (308.7 × 10⁻⁶) = **207.3 Mbps**

## Part 7: Throughput Calculation Explained

Throughput is the ultimate measure of performance—how fast you can actually transfer useful application data.

The formula is straightforward:

```
Throughput (Mbps) = (Application Payload in bits) / (Total Airtime in seconds)
```

The calculator provides two throughput metrics to give you a complete picture:

1. **Throughput including IFS & CW**: This shows the "real-world" efficiency, as it includes the time spent waiting for channel access.

2. **Throughput excluding IFS & CW**: This shows the raw data transfer efficiency once the device has gained access to the channel.

---

*This documentation provides the theoretical foundation for understanding Wi-Fi airtime calculations. For the most up-to-date implementation details and specific calculation methods used in the Wi-Fi Airtime Calculator, please refer to the source code and technical specifications.*
