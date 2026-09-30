---
title: "8085 Microprocessor in VHDL"
summary: "An Intel 8085 built in VHDL: a decoder for all 256 opcodes, a fetch–decode–execute state machine and prioritised interrupts, verified in Synopsys VCS with self-checking testbenches."
featured: true
order: 68
tags: ["VHDL", "CPU Design", "Synopsys VCS", "FSM"]
cover: ./cover.jpg
coverAlt: "Simulation waveform of the 8085 core: the clock, program counter, opcode and state signals while a program runs and an interrupt is taken."
metrics:
  - value: "256"
    label: "opcodes decoded"
  - value: "5,800"
    label: "lines of VHDL in 17 files"
---

An Intel 8085 microprocessor modelled in VHDL for the Microprocessor System Design
course. The brief asked for the control unit and instruction decoder. The design goes
further and wraps them in a working processor, with an ALU, a register file, flags, a
stack pointer, a program counter and memory.

The decoder recognises all 256 opcodes and turns each into ALU, register, memory and I/O
control signals. A state machine sequences every instruction through fetch, decode and
execute, with separate states for servicing an interrupt and for halt. An interrupt
controller handles RST7.5, RST6.5, RST5.5 and INTR in priority order, along with EI, DI
and the SIM masks.

![The full simulation waveform: memory is programmed, the program runs through fetch, decode and execute states, then RST7.5, RST6.5, RST5.5 and INTR are raised together and the program counter jumps to 003C.](./interrupt-priority.png)

Everything was simulated in Synopsys VCS. One testbench loads a short program, runs it,
and asserts the register and memory contents afterwards. It then raises all four
interrupts at once, and the waveform shows the processor vectoring to 003Ch, the RST7.5
handler and the highest priority.

![Waveform of a short program: register A is loaded with 32h, register B with 11h, and after ADD B register A reads 43h.](./add-program.png)
