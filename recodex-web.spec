%define name recodex-web
%define short_name web-app
%define version 1.12.5
%define unmangled_version 5a57553de1311dc3dc2f02a8a1b1de65fc731fb1
%define release 1

Summary: ReCodEx web-app component
Name: %{name}
Version: %{version}
Release: %{release}
License: MIT
Group: Development/Libraries
BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}-buildroot
Prefix: %{_prefix}
Vendor: Petr Stefan <UNKNOWN>
Url: https://github.com/ReCodEx/web-app
BuildRequires: systemd nodejs-packaging npm
Requires(post): systemd
Requires(preun): systemd
Requires(postun): systemd
Requires: nodejs

#Source0: %{name}-%{unmangled_version}.tar.gz
Source0: https://github.com/ReCodEx/%{short_name}/archive/%{unmangled_version}.tar.gz#/%{short_name}-%{unmangled_version}.tar.gz

%define debug_package %{nil}

%description
Web-app of ReCodEx programmer testing solution.

%prep
%setup -n %{short_name}-%{unmangled_version}

%build
rm -f .gitignore
rm -rf node_modules
npm i yarn
mv ./node_modules ./yarn_modules
cat <<__EOF > .env
NODE_ENV=production
VERSION=v%{version}
__EOF
./yarn_modules/yarn/bin/yarn install
./yarn_modules/yarn/bin/yarn build
./yarn_modules/yarn/bin/yarn deploy

%install
install -d  %{buildroot}/opt/%{name}
cp -r ./prod/* %{buildroot}/opt/%{name}
install -d %{buildroot}/lib/systemd/system
cp -r install/recodex-web.service %{buildroot}/lib/systemd/system/recodex-web.service

%clean


%post
%systemd_post 'recodex-web.service'

%postun
%systemd_postun_with_restart 'recodex-web.service'

%pre
getent group recodex >/dev/null || groupadd -r recodex
getent passwd recodex >/dev/null || useradd -r -g recodex -d %{_sysconfdir}/recodex -s /sbin/nologin -c "ReCodEx Code Examiner" recodex
exit 0

%preun
%systemd_preun 'recodex-web.service'

%files
%defattr(-,recodex,recodex)
%dir /opt/%{name}

/opt/%{name}/bin/*
/opt/%{name}/public/*
/opt/%{name}/views/*
%config(noreplace) /opt/%{name}/etc/env.json

#%{_unitdir}/recodex-web.service
%attr(-,root,root) /lib/systemd/system/recodex-web.service

%changelog

