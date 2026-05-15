# PingPerf — ICMP-Based Throughput Testing for IoT Devices

A web-based tool that uses ICMP (ping) to measure throughput, latency, jitter, and packet loss on IoT devices — where tools like iperf3 can't be installed or no access to console.

---

## Problem Statement

There are plenty of throughput testing tools out there — iperf3 being the go-to. But consider this scenario:

> You want to test the peak wireless performance of an IoT chipset — say, a security camera, washing machine, voice assitant connected to the router. No console access. No SSH. No way to install iperf3 or any custom binary. The device is completely locked down.

How do you measure throughput?

---

## Solution: ICMP

Any network device must reply to a ping request with an equal-sized response. That's the ICMP protocol — and it's universally supported.

By controlling the **payload size**, **send interval** of ping requests and number of ping sessions, we can generate a known traffic load and estimate throughput from the results.

---

## Core Concepts

### What is Throughput?

The rate at which data is successfully transferred, measured in **bits per second (bps)**.

---

## Throughput Calculation

### Uplink Throughput (Transmit)

Uplink is straightforward — we control exactly what we send:

```
                    Payload (bytes) × Packets Sent × 8
Uplink (bps)  =  ─────────────────────────────────────
                      Interval (sec) × Packets Sent
```

Since ICMP is bidirectional (request + response), the **total intended load** on the medium is approximately **2× the uplink** value.

### Downlink Throughput (Receive)

Downlink accounts for real-world conditions — packet loss, retransmissions, congestion. We measure it by counting how many responses actually arrive:

```
                        Packets Received × Payload (bytes) × 8
Downlink (bps)  =  ───────────────────────────────────────────
                                    1 second
```

The tool counts received packets per second and computes downlink throughput at per-second granularity.

---

## Proof of Concept

| Parameter      | Value        |
|----------------|--------------|
| Payload size   | 1,449 bytes  |
| Send interval  | 2 ms (0.002s)|
| Packet count   | 500          |

**Uplink calculation:**

```
(1449 × 500 × 8) / (0.002 × 500) = 5,796,000 / 1 = 5.79 Mbps uplink
```

**Bidirectional load:**

Since the target device echoes back an equal-sized response:

```
Total intended load ≈ 5.79 × 2 ≈ 11.58 Mbps
```

**Equivalent ping command for test duaration 1 sec:**

```bash
ping -s 1449 -i 0.002 -c 500 <TARGET_IP>
```

---

## Measured Metrics

| Metric              | Description                                    |
|---------------------|------------------------------------------------|
| Uplink Throughput   | Based on packets sent and configured parameters|
| Downlink Throughput | Based on packets received per second           |
| Latency (RTT)       | Round-trip time per packet                     |
| Jitter              | Variation in latency between consecutive packets|
| Packet Loss         | Percentage of requests with no response        |
| Max throughput      | Round-trip time per packet                     |
| Min throughput      | Variation in latency between consecutive packets|
| Avg throughput      | Percentage of requests with no response        |
| Bidirectional throughput | Percentage of requests with no response        |
---

## Tool Parameters

The tool collects the following inputs from the user:

| #  | Parameter            | Description                                                        | Default                    |
|----|----------------------|--------------------------------------------------------------------|----------------------------|
| i  | Target Throughput    | Desired throughput to generate (select K, M, G)                    | —                          |
| ii | Compensation Mode    | Vary **payload size** or **interval** to achieve target throughput  | —                          |
| iii| Test Duration        | How long the test should run                                       | —                          |
| iv | Output File Path     | Where to save results(default `/tmp/test-<datetime>.log`, else `/<given path>/<testname>-<datetime>.log`)                                    |
| v  | Target IP            | IP address of the IoT device under test                            | —                          |
| vi | Test Name            | Label for this test session (default `test`)                       | —                          |
| vii| Source OS            | OS of the host executing the ping command (affects syntax)         | —                          |
| viii| Max Payload Size    | Upper limit for ICMP payload (max 65,000 bytes)                    | 65,000                     |

---

## Usage Modes

The tool is accessed via a web page and supports two modes:

### Mode 1: Command Generator + Offline Analysis

1. User provides the parameters above
2. Tool composes the appropriate `ping` command(s)
3. User copies the command and executes it on any host against any target
4. User uploads the ping output file back into the tool
5. Tool parses the output and displays:
   - Uplink, Downlink, bidirectional throughput (per second)
   - Max throughput (downlink, bidirectional)
   - Min throughput (downlink, bidirectional)
   - Avg throuput
   - Latency and jitter
   - 2D time-series plots
   - iperf-style columnar console output with timestamps

### Mode 2: Live Mode

1. The host running the web page executes ping directly to the target
2. Real-time display of:
   - Downlink throughput (per second)
   - Latency and jitter
   - 2D time-series plots
   - iperf-style columnar console output with timestamps
3. User can **stop and resume** the session
4. On completion, user can **download** all plots and console output
5. User can then start a new test session

---

## Auto-Scaling: Concurrent Ping Sessions

Ping has hard limits:

| Constraint        | Limit          |
|-------------------|----------------|
| Max payload size  | 65,000 bytes   |
| Min send interval | 0.002 sec (2ms)|

**Single ping session max throughput:**

```
(65000 × 8) / 0.002 = 260,000,000 bps = 260 Mbps
```

If the user's target throughput exceeds what a single ping session can generate, the tool automatically:

1. Calculates the number of concurrent ping sessions required
2. Distributes the load equally across sessions
3. Runs them in parallel

**Example:** Target = 500 Mbps → Tool spawns 2 sessions at ~250 Mbps each.

---

## Output Format

Results are presented in an iperf-style columnar format:

```
[ ID]  Interval        Transfer     Throughput     Jitter    Lost/Total
[  1]  0.00-1.00 sec   724 KBytes   5.79 Mbps     2.1 ms    10/500 (2%)
[  1]  1.00-2.00 sec   710 KBytes   5.68 Mbps     2.4 ms    14/500 (2.8%)
[  1]  2.00-3.00 sec   718 KBytes   5.74 Mbps     1.9 ms    12/500 (2.4%)
...
```

---

## Logging

All test results are saved to:

```
/tmp/<testname>-<datetime>.log
```

User can override the path via the output file parameter.
