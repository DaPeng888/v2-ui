import logging
import time

import psutil
from apscheduler.triggers.interval import IntervalTrigger

from util import cmd_util
from util.schedule_util import scheduler

__status = {}
__last_access = time.time()
__last_get = time.time()
__access_interval = 0
__get_interval = 0


def get_status():
    global __last_access
    __last_access = time.time()
    return __status


@scheduler.scheduled_job(trigger=IntervalTrigger(seconds=1))
def flush_status():
    global __access_interval
    try:
        now = time.time()
        __access_interval = now - __last_access
        if __access_interval <= 60:
            # 若距离上次获取时间不超过 60 秒才真正去获取系统信息，以节省 CPU 资源
            global __get_interval, __last_get
            __get_interval = now - __last_get
            __last_get = now
            v2_status()
            uptime()
            cpu()
            memory()
            swap()
            disk()
            loads()
            net()
    except Exception as e:
        logging.warning('获取系统状态信息失败：' + str(e))


def v2_status():
    result, code = cmd_util.exec_cmd('systemctl is-active v2ray')
    if result.startswith('active'):
        code = 0
    elif result.startswith('inactive'):
        code = 1
    else:
        code = 2
    __status['v2'] = {
        'code': code
    }


def uptime():
    __status['uptime'] = time.time() - psutil.boot_time()


__last_ct = psutil.cpu_times()


def cpu():
    global __last_ct
    cur_ct = psutil.cpu_times()

    last_total = sum(__last_ct)
    cur_total = sum(cur_ct)

    total = cur_total - last_total
    idle = cur_ct.idle - __last_ct.idle

    percent = (total - idle) / total * 100
    __last_ct = cur_ct
    __status['cpu'] = {
        'percent': percent
    }


def memory():
    mem = psutil.virtual_memory()
    __status['memory'] = {
        'used': mem.used,
        'total': mem.total
    }


def swap():
    swap_mem = psutil.swap_memory()
    __status['swap'] = {
        'used': swap_mem.used,
        'total': swap_mem.total
    }


def disk():
    d = psutil.disk_usage('/')
    __status['disk'] = {
        'total': d.total,
        'used': d.used
    }


def loads():
    __status['loads'] = psutil.getloadavg()


__last_net_io = psutil.net_io_counters()


def __get_net_tcp_udp_count():
    conns = psutil.net_connections()
    tcp_count = 0
    udp_count = 0
    for conn in conns:
        if conn.type == 1:
            tcp_count += 1
        elif conn.type == 2:
            udp_count += 1
    return tcp_count, udp_count


def net():
    global __last_net_io
    cur_net_io = psutil.net_io_counters()
    sent = cur_net_io.bytes_sent
    recv = cur_net_io.bytes_recv
    up = (sent - __last_net_io.bytes_sent) / __get_interval
    down = (recv - __last_net_io.bytes_recv) / __get_interval
    tcp_count, udp_count = __get_net_tcp_udp_count()
    __status['net_io'] = {
        'up': up,
        'down': down
    }
    __status['net_traffic'] = {
        'sent': sent,
        'recv': recv
    }
    __status['tcp_count'] = tcp_count
    __status['udp_count'] = udp_count
    __last_net_io = cur_net_io


if __name__ == '__main__':
    time.sleep(1)
    while True:
        time.sleep(1)
        print(get_status())
