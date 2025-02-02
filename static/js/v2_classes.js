const Protocols = {
    VMESS: 'vmess',
    SHADOWSOCKS: 'shadowsocks',
    DOKODEMO: 'dokodemo-door',
    MTPROTO: 'mtproto',
    SOCKS: 'socks',
    HTTP: 'http',
    FREEDOM: 'freedom',
    BLACKHOLE: 'blackhole',
};

const VmessMethods = {
    AES_128_GCM: 'aes-128-gcm',
    CHACHA20_POLY1305: 'chacha20-poly1305',
    AUTO: 'auto',
    NONE: 'none',
};

const SSMethods = {
    AES_256_CFB: 'aes-256-cfb',
    AES_128_CFB: 'aes-128-cfb',
    CHACHA20: 'chacha20',
    CHACHA20_IETF: 'chacha20-ietf',
    CHACHA20_POLY1305: 'chacha20-poly1305',
    AES_256_GCM: 'aes-256-gcm',
    AES_128_GCM: 'aes-128-gcm',
};

const RULE_IP = {
    PRIVATE: 'geoip:private',
    CN: 'geoip:cn',
};

const RULE_DOMAIN = {
    ADS: 'geosite:category-ads',
    ADS_ALL: 'geosite:category-ads-all',
    CN: 'geosite:cn',
    GOOGLE: 'geosite:google',
    FACEBOOK: 'geosite:facebook',
    SPEEDTEST: 'geosite:speedtest',
};

Object.freeze(Protocols);
Object.freeze(VmessMethods);
Object.freeze(SSMethods);
Object.freeze(RULE_IP);
Object.freeze(RULE_DOMAIN);

class V2CommonClass {

    static toJsonArray(arr) {
        return arr.map(obj => obj.toJson());
    }

    static base64(str) {
        return btoa(str);
    }

    static safeBase64(str) {
        return V2CommonClass.base64(str)
            .replace(/\+/g, '-')
            .replace(/=/g, '')
            .replace(/\//g, '_');
    }

    static fromJson() {
        return new V2CommonClass();
    }

    static emptyOrDefault(obj, defaultValue) {
        if (isArrEmpty(obj)) {
            return defaultValue;
        }
        return clone(obj);
    }

    toJson() {
        return this;
    }

    toString(format=true) {
        return format ? JSON.stringify(this.toJson(), null, 2) : JSON.stringify(this.toJson());
    }

    static putHeader(headers, name, value, arr=true) {
        if (!(name in headers)) {
            headers[name] = arr ? [value] : value;
        } else {
            if (arr) {
                headers[name].push(value);
            } else {
                headers[name] = value;
            }
        }
    }

    static removeHeader(headers, name, value, arr=true) {
        if (name in headers) {
            if (arr) {
                let values = headers[name];
                let index = values.indexOf(values);
                if (index >= 0) {
                    values.splice(index, 1);
                }
                if (values.length === 0) {
                    delete headers[name];
                }
            } else {
                delete headers[name];
            }
        }
    }
}

class TcpStreamSettings extends V2CommonClass {
    constructor(type='none',
                request=new TcpStreamSettings.TcpRequest(),
                response=new TcpStreamSettings.TcpResponse(),
                ) {
        super();
        this.type = type;
        this.request = request;
        this.response = response;
    }

    putReqHeader(name, value) {
        let headers = this.request.headers;
        TcpStreamSettings.putHeader(headers, name, value);
    }

    removeReqHeader(name, value) {
        let headers = this.request.headers;
        TcpStreamSettings.removeHeader(headers, name, value);
    }

    putResHeader(name, value) {
        let headers = this.response.headers;
        TcpStreamSettings.putHeader(headers, name, value);
    }

    removeResHeader(name, value) {
        let headers = this.response.headers;
        TcpStreamSettings.removeHeader(headers, name, value);
    }

    static fromJson(json={}) {
        return new TcpStreamSettings(
            json.type,
            TcpStreamSettings.TcpRequest.fromJson(json.request),
            TcpStreamSettings.TcpResponse.fromJson(json.response),
        );
    }

    toJson() {
        return {
            type: this.type,
            request: this.type === 'http' ? this.request.toJson() : undefined,
            response: this.type === 'http' ? this.response.toJson() : undefined,
        };
    }
}

TcpStreamSettings.TcpRequest = class extends V2CommonClass {
    constructor(version='1.1',
                method='GET',
                path=['/'],
                headers={},
    ) {
        super();
        this.version = version;
        this.method = method;
        this.path = path.length === 0 ? [''] : path;
        this.headers = headers;
    }

    addPath(path) {
        this.path.push(path);
    }

    removePath(index) {
        this.path.splice(index, 1);
    }

    static fromJson(json={}) {
        return new TcpStreamSettings.TcpRequest(
            json.version,
            json.method,
            json.path,
            json.headers,
        );
    }

    toJson() {
        return {
            method: this.method,
            path: clone(this.path),
            headers: clone(this.headers),
        };
    }
};

TcpStreamSettings.TcpResponse = class extends V2CommonClass {
    constructor(version='1.1',
                status='200',
                reason='OK',
                headers={},
    ) {
        super();
        this.version = version;
        this.status = status;
        this.reason = reason;
        this.headers = headers;
    }

    static fromJson(json={}) {
        return new TcpStreamSettings.TcpResponse(
            json.version,
            json.status,
            json.reason,
            json.headers,
        );
    }

    toJson() {
        return {
            version: this.version,
            status: this.status,
            reason: this.reason,
            headers: clone(this.headers),
        };
    }
};

class KcpStreamSettings extends V2CommonClass {
    constructor(mtu=1350, tti=20,
                uplinkCapacity=5,
                downlinkCapacity=20,
                congestion=false,
                readBufferSize=2,
                writeBufferSize=2,
                type='none',
                ) {
        super();
        this.mtu = mtu;
        this.tti = tti;
        this.upCap = uplinkCapacity;
        this.downCap = downlinkCapacity;
        this.congestion = congestion;
        this.readBuffer = readBufferSize;
        this.writeBuffer = writeBufferSize;
        this.type = type;
    }

    static fromJson(json={}) {
        return new KcpStreamSettings(
            json.mtu,
            json.tti,
            json.uplinkCapacity,
            json.downlinkCapacity,
            json.congestion,
            json.readBufferSize,
            json.writeBufferSize,
            isEmpty(json.header) ? 'none' : json.header.type,
        );
    }

    toJson() {
        return {
            mtu: this.mtu,
            tti: this.tti,
            uplinkCapacity: this.upCap,
            downlinkCapacity: this.downCap,
            congestion: this.congestion,
            readBufferSize: this.readBuffer,
            writeBufferSize: this.writeBuffer,
            header: {
                type: this.type,
            },
        };
    }
}

class WsStreamSettings extends V2CommonClass {
    constructor(path='/', headers={}) {
        super();
        this.path = path;
        this.headers = headers;
    }

    putHeader(name, value) {
        V2CommonClass.putHeader(this.headers, name, value, false);
    }

    removeHeader(name, value) {
        V2CommonClass.removeHeader(this.headers, name, value, false);
    }

    static fromJson(json={}) {
        return new WsStreamSettings(
            json.path,
            json.headers,
        );
    }

    toJson() {
        return {
            path: this.path,
            headers: clone(this.headers),
        };
    }
}

class HttpStreamSettings extends V2CommonClass {
    constructor(path='/', host=['']) {
        super();
        this.path = path;
        this.host = host.length === 0 ? [''] : host;
    }

    addHost(host) {
        this.host.push(host);
    }

    removeHost(index) {
        this.host.splice(index, 1);
    }

    static fromJson(json={}) {
        return new HttpStreamSettings(json.path, json.host);
    }

    toJson() {
        let host = [];
        for (let i = 0; i < this.host.length; ++i) {
            if (!isEmpty(this.host[i])) {
                host.push(this.host[i]);
            }
        }
        return {
            path: this.path,
            host: host,
        }
    }
}

class TlsStreamSettings extends V2CommonClass {
    constructor(serverName='',
                allowInsecure=true,
                certificates=[new TlsStreamSettings.Cert()]) {
        super();
        this.server = serverName;
        this.allowInsecure = allowInsecure;
        this.certs = certificates;
    }

    addCert(cert) {
        this.certs.push(cert);
    }

    removeCert(index) {
        this.certs.splice(index, 1);
    }

    static fromJson(json={}) {
        let certs;
        if (!isEmpty(json.certificates)) {
            certs = json.certificates.map(cert => TlsStreamSettings.Cert.fromJson(cert));
        }
        return new TlsStreamSettings(
            json.serverName,
            json.allowInsecure,
            certs,
        );
    }

    toJson() {
        return {
            serverName: this.server,
            allowInsecure: this.allowInsecure,
            certificates: TlsStreamSettings.toJsonArray(this.certs),
        };
    }
}

TlsStreamSettings.Cert = class extends V2CommonClass {
    constructor(useFile=true, certificateFile='', keyFile='', certificate='', key='') {
        super();
        this.useFile = useFile;
        this.certFile = certificateFile;
        this.keyFile = keyFile;
        this.cert = certificate instanceof Array ? certificate.join('\n') : certificate;
        this.key = key instanceof Array ? key.join('\n') : key;
    }

    static fromJson(json={}) {
        if ('certificateFile' in json && 'keyFile' in json) {
            return new TlsStreamSettings.Cert(
                true,
                json.certificateFile,
                json.keyFile,
            );
        } else {
            return new TlsStreamSettings.Cert(
                false, '', '',
                json.certificate.join('\n'),
                json.key.join('\n'),
            );
        }
    }

    toJson() {
        if (this.useFile) {
            return {
                certificateFile: this.certFile,
                keyFile: this.keyFile,
            };
        } else {
            return {
                certificate: this.cert.split('\n'),
                key: this.key.split('\n'),
            };
        }
    }
};

class StreamSettings extends V2CommonClass {
    constructor(network='tcp',
                security='none',
                tlsSettings=new TlsStreamSettings(),
                tcpSettings=new TcpStreamSettings(),
                kcpSettings=new KcpStreamSettings(),
                wsSettings=new WsStreamSettings(),
                httpSettings=new HttpStreamSettings(),
                ) {
        super();
        this.network = network;
        this.security = security;
        this.tls = tlsSettings;
        this.tcp = tcpSettings;
        this.kcp = kcpSettings;
        this.ws = wsSettings;
        this.http = httpSettings;
    }

    static fromJson(json={}) {
        return new StreamSettings(
            json.network,
            json.security,
            TlsStreamSettings.fromJson(json.tlsSettings),
            TcpStreamSettings.fromJson(json.tcpSettings),
            KcpStreamSettings.fromJson(json.kcpSettings),
            WsStreamSettings.fromJson(json.wsSettings),
            HttpStreamSettings.fromJson(json.httpSettings),
        );
    }

    toJson() {
        let network = this.network;
        let security = this.security;
        return {
            network: network,
            security: security,
            tlsSettings: security === 'tls' && ['ws', 'http'].indexOf(network) >= 0 ? this.tls.toJson() : undefined,
            tcpSettings: network === 'tcp' ? this.tcp.toJson() : undefined,
            kcpSettings: network === 'kcp' ? this.kcp.toJson() : undefined,
            wsSettings: network === 'ws' ? this.ws.toJson() : undefined,
            httpSettings: network === 'http' ? this.http.toJson() : undefined,
        };
    }
}

class Sniffing extends V2CommonClass {
    constructor(enabled=true, destOverride=['http', 'tls']) {
        super();
        this.enabled = enabled;
        this.destOverride = destOverride;
    }

    static fromJson(json={}) {
        return new Sniffing(
            !!json.enabled,
            clone(json.destOverride),
        );
    }
}

class Inbound extends V2CommonClass {
    constructor(port=randomIntRange(10000, 60000),
                listen='0.0.0.0',
                protocol=Protocols.VMESS,
                settings=null,
                streamSettings=new StreamSettings(),
                tag='',
                sniffing=new Sniffing(),
                remark='',
                enable=true,
                ) {
        super();
        this.port = port;
        this.listen = listen;
        this.protocol = protocol;
        this.settings = isEmpty(settings) ? Inbound.Settings.getSettings(protocol) : settings;
        this.stream = streamSettings;
        this.tag = tag;
        this.sniffing = sniffing;
        this.remark = remark;
        this.enable = enable;
    }

    reset() {
        this.port = randomIntRange(10000, 60000);
        this.listen = '0.0.0.0';
        this.protocol = Protocols.VMESS;
        this.settings = Inbound.Settings.getSettings(Protocols.VMESS);
        this.stream = new StreamSettings();
        this.tag = '';
        this.sniffing = new Sniffing();
        this.remark = '';
        this.enable = true;
    }

    genVmessLink(address='') {
        if (this.protocol !== Protocols.VMESS) {
            return '';
        }
        let network = this.stream.network;
        let type = 'none';
        let host = '';
        let path = '';
        if (network === 'tcp') {
            let tcp = this.stream.tcp;
            type = tcp.type;
            if (type === 'http') {
                let request = tcp.request;
                path = request.path.join(',');
                let h = propIgnoreCase(request.headers, 'host');
                if (!isEmpty(h)) {
                    host = h.join(',');
                }
            }
        } else if (network === 'kcp') {
            let kcp = this.stream.kcp;
            type = kcp.type;
        } else if (network === 'ws') {
            let ws = this.stream.ws;
            path = ws.path;
            let h = propIgnoreCase(ws.headers, 'host');
            if (!isEmpty(h)) {
                host = h.join(',');
            }
        } else if (network === 'http') {
            network = 'h2';
            path = this.stream.http.path;
            host = this.stream.http.host.join(',');
        }
        let obj = {
            v: '2',
            ps: this.remark,
            add: address,
            port: this.port,
            id: this.settings.vmesses[0].id,
            aid: this.settings.vmesses[0].alterId,
            net: network,
            type: type,
            host: host,
            path: path,
            tls: this.stream.security,
        };
        return 'vmess://' + Inbound.base64(JSON.stringify(obj, null, 2));
    }

    genSSLink(address='') {
        let settings = this.settings;
        return 'ss://' + Inbound.safeBase64(settings.method + ':' + settings.password + '@' + address + ':' + this.port)
            + '#' + encodeURIComponent(this.remark);
    }

    genLink(address='') {
        switch (this.protocol) {
            case Protocols.VMESS: return this.genVmessLink(address);
            case Protocols.SHADOWSOCKS: return this.genSSLink(address);
            default: return '';
        }
    }

    static fromJson(json={}) {
        return new Inbound(
            json.port,
            json.listen,
            json.protocol,
            Inbound.Settings.fromJson(json.protocol, json.settings),
            StreamSettings.fromJson(json.streamSettings),
            json.tag,
            Sniffing.fromJson(json.sniffing),
            json.remark,
            json.enable,
        )
    }

    toJson() {
        let streamSettings;
        if (this.protocol === Protocols.VMESS) {
            streamSettings = this.stream.toJson();
        }
        return {
            port: this.port,
            listen: this.listen,
            protocol: this.protocol,
            settings: this.settings instanceof V2CommonClass ? this.settings.toJson() : this.settings,
            streamSettings: streamSettings,
            tag: this.tag,
            sniffing: this.sniffing.toJson(),
            remark: this.remark,
            enable: this.enable,
        };
    }
}

Inbound.Settings = class extends V2CommonClass {
    constructor(protocol) {
        super();
        this.protocol = protocol;
    }

    static getSettings(protocol) {
        switch (protocol) {
            case Protocols.VMESS: return new Inbound.VmessSettings(protocol);
            case Protocols.SHADOWSOCKS: return new Inbound.ShadowsocksSettings(protocol);
            case Protocols.DOKODEMO: return new Inbound.DokodemoSettings(protocol);
            case Protocols.MTPROTO: return new Inbound.MtprotoSettings(protocol);
            case Protocols.SOCKS: return new Inbound.SocksSettings(protocol);
            case Protocols.HTTP: return new Inbound.HttpSettings(protocol);
            default: return null;
        }
    }

    static fromJson(protocol, json) {
        switch (protocol) {
            case Protocols.VMESS: return Inbound.VmessSettings.fromJson(json);
            case Protocols.SHADOWSOCKS: return Inbound.ShadowsocksSettings.fromJson(json);
            case Protocols.DOKODEMO: return Inbound.DokodemoSettings.fromJson(json);
            case Protocols.MTPROTO: return Inbound.MtprotoSettings.fromJson(json);
            case Protocols.SOCKS: return Inbound.SocksSettings.fromJson(json);
            case Protocols.HTTP: return Inbound.HttpSettings.fromJson(json);
            default: return null;
        }
    }

    toJson() {
        return {};
    }
};

Inbound.VmessSettings = class extends Inbound.Settings {
    constructor(protocol, vmesses=[new Inbound.VmessSettings.Vmess()]) {
        super(protocol);
        this.vmesses = vmesses;
    }

    indexOfVmessById(id) {
        return this.vmesses.findIndex(vmess => vmess.id === id);
    }

    addVmess(vmess) {
        if (this.indexOfVmessById(vmess.id) >= 0) {
            return false;
        }
        this.vmesses.push(vmess);
    }

    delVmess(vmess) {
        const i = this.indexOfVmessById(vmess.id);
        if (i >= 0) {
            this.vmesses.splice(i, 1);
        }
    }

    static fromJson(json={}) {
        return new Inbound.VmessSettings(
            Protocols.VMESS,
            json.clients.map(client => Inbound.VmessSettings.Vmess.fromJson(client)),
        );
    }

    toJson() {
        return {
            'clients': Inbound.VmessSettings.toJsonArray(this.vmesses),
        };
    }
};
Inbound.VmessSettings.Vmess = class extends V2CommonClass {
    constructor(id=randomUUID(), alterId=64) {
        super();
        this.id = id;
        this.alterId = alterId;
    }

    static fromJson(json={}) {
        return new Inbound.VmessSettings.Vmess(
            json.id,
            json.alterId,
        );
    }
};

Inbound.ShadowsocksSettings = class extends Inbound.Settings {
    constructor(protocol,
                method=SSMethods.AES_256_GCM,
                password=randomSeq(10),
                network='tcp,udp'
    ) {
        super(protocol);
        this.method = method;
        this.password = password;
        this.network = network;
    }

    static fromJson(json={}) {
        return new Inbound.ShadowsocksSettings(
            Protocols.SHADOWSOCKS,
            json.method,
            json.password,
            json.network,
        );
    }

    toJson() {
        return {
            method: this.method,
            password: this.password,
            network: this.network,
        };
    }
};

Inbound.DokodemoSettings = class extends Inbound.Settings {
    constructor(protocol, address, port, network='tcp,udp') {
        super(protocol);
        this.address = address;
        this.port = port;
        this.network = network;
    }

    static fromJson(json={}) {
        return new Inbound.DokodemoSettings(
            Protocols.DOKODEMO,
            json.address,
            json.port,
            json.network,
        );
    }

    toJson() {
        return {
            address: this.address,
            port: this.port,
            network: this.network,
        };
    }
};

Inbound.MtprotoSettings = class extends Inbound.Settings {
    constructor(protocol, users=[new Inbound.MtprotoSettings.MtUser()]) {
        super(protocol);
        this.users = users;
    }

    static fromJson(json={}) {
        return new Inbound.MtprotoSettings(
            Protocols.MTPROTO,
            json.users.map(user => Inbound.MtprotoSettings.MtUser.fromJson(user)),
        );
    }

    toJson() {
        return {
            users: V2CommonClass.toJsonArray(this.users),
        };
    }
};
Inbound.MtprotoSettings.MtUser = class extends V2CommonClass {
    constructor(secret=randomMTSecret()) {
        super();
        this.secret = secret;
    }

    static fromJson(json={}) {
        return new Inbound.MtprotoSettings.MtUser(json.secret);
    }
};

Inbound.SocksSettings = class extends Inbound.Settings {
    constructor(protocol, auth='password', accounts=[new Inbound.SocksSettings.SocksAccount()], udp=false, ip='127.0.0.1') {
        super(protocol);
        this.auth = auth;
        this.accounts = accounts;
        this.udp = udp;
        this.ip = ip;
    }

    addAccount(account) {
        this.accounts.push(account);
    }

    delAccount(index) {
        this.accounts.splice(index, 1);
    }

    static fromJson(json={}) {
        let accounts;
        if (json.auth === 'password') {
            accounts = json.accounts.map(
                account => Inbound.SocksSettings.SocksAccount.fromJson(account)
            )
        }
        return new Inbound.SocksSettings(
            Protocols.SOCKS,
            json.auth,
            accounts,
            json.udp,
            json.ip,
        );
    }

    toJson() {
        return {
            auth: this.auth,
            accounts: this.auth === 'password' ? this.accounts.map(account => account.toJson()) : undefined,
            udp: this.udp,
            ip: this.ip,
        };
    }
};
Inbound.SocksSettings.SocksAccount = class extends V2CommonClass {
    constructor(user=randomSeq(10), pass=randomSeq(10)) {
        super();
        this.user = user;
        this.pass = pass;
    }

    static fromJson(json={}) {
        return new Inbound.SocksSettings.SocksAccount(json.user, json.pass);
    }
};

Inbound.HttpSettings = class extends Inbound.Settings {
    constructor(protocol, accounts=[new Inbound.HttpSettings.HttpAccount()]) {
        super(protocol);
        this.accounts = accounts;
    }

    addAccount(account) {
        this.accounts.push(account);
    }

    delAccount(index) {
        this.accounts.splice(index, 1);
    }

    static fromJson(json={}) {
        return new Inbound.HttpSettings(
            Protocols.HTTP,
            json.accounts.map(account => Inbound.HttpSettings.HttpAccount.fromJson(account)),
        );
    }

    toJson() {
        return {
            accounts: Inbound.HttpSettings.toJsonArray(this.accounts),
        };
    }
};

Inbound.HttpSettings.HttpAccount = class extends V2CommonClass {
    constructor(user=randomSeq(10), pass=randomSeq(10)) {
        super();
        this.user = user;
        this.pass = pass;
    }

    static fromJson(json={}) {
        return new Inbound.HttpSettings.HttpAccount(json.user, json.pass);
    }
};
