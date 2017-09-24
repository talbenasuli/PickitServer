@echo off
netsh interface ip set address "Wi-Fi" static 10.0.0.91 255.255.255.0 10.0.0.138
netsh interface ipv4 set dns name="Wi-Fi" static 8.8.8.8
pause