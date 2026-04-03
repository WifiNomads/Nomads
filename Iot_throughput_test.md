\Throughput test on IoT. 

 

Problem statement. 


We have enough 3Party 2Party 1Party, Software Tools to measure throughput. Yes iperf3 is 1 in it. 

Imagine a situation. Where you were  curious to test the peak performance  of an iot chipset, for an instance, in a washing machine going to residing far away from router. 

No console, no SSH, entirely locked to starte a tool like Iperf3 se2rver in it. 

Here comes a hack to do it.  

Solution. 

ICMP.....! any network device should reply equal message to a ping request.

A quick overview. 
    i. What is throughput? 
    a. Measure  of speed at which data  is transfering with units bps (bit per second)


Proof of concept

Suppose if I send 1000 bytes, example 8000 bits every second as ping request, it is equivalent to the 8kbps load. 

assume I sent 1449 bytes at 2 milliseconds interval. 

(1449 bytes x 500 x eight ) / (2 x 10^-3 x 500) is nearly equal to equivalent 5.79 mpbs. 
but will get response from target device, 
hence it is total theroritical equivalent  to the 11 .0 mbps total inteneded load By direction throughput test is conducted. 

How do you measure downlink throuput? 

uplink is a straightforward calculation. 

Download is little bit logic. 

Again throughput equal to number of bits per second. 

So if we count number of pings received within every second, then download downlink throughput equal to 
(number of packet received x given payload size in bytes x eight) / (1 second). 

 

Features and functionalities and others of tool. 

Tool will first aquire these details from user

    i. throughput,  
    ii. should payload size vary or time interval vary to compensate equivalent throughput,  
    iii. Duration of test,  
    iv. file path to where the output should be saved, default slash,( default /tmp/xx-datetime.log )
    v. Target IP.
    vi. testname
    vii. OS of the source host where this command is going to execute
    viii. What is the max payload size (max 65000)

This tool can be used in 2 ways via a web page,

    1st method,
        1. Will compose command to copy and execute on any host to any target based on the above parameters  
        2. If the user uploads the ping output file, user should be able to measure downlink throughput, jitter, latency, plot in a second in 2D plot, give the output in like iperf does including timestamps in coulmn console output section below.

    2nd method,
        1. Live mode, the host in which web page loaded will start ping to the target for given parameters and measure downlink throughput, jitter, latency, plot in a second in 2D plot, give the output in below console like how iperf does including timestamps in console output section below.
        2. user can stop and resume the session and complete the test to download all the plots and console output, then can open new test sesion.


Based on given params, tool should compose the command and do ping commands accordingly. If the throughput requirement exceeds the ping params max limit(max bytes size 65000 bytes, minimum interval = 0.002 sec i.e., 2ms), it has to concurently run multiple pings to acheive and values equally distributed among the ping sessions.  

 