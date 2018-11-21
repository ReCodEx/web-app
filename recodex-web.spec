%define name recodex-web
%define short_name web-app
%define version 1.0.0
%define unmangled_version 418315b23946956810749814c1ab5e0eebf37901
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
AutoReq: no
AutoProv: no

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
cat <<__EOF > .env
NODE_ENV=production
__EOF
npm -q install
npm run build
npm run deploy

%install
install -d  %{buildroot}/opt/%{name}
cp -r ./prod %{buildroot}/opt/%{name}
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
%defattr(-,root,root)
#%dir %attr(-,recodex,recodex) %{_sysconfdir}/recodex/worker
%dir %attr(-, recodex,recodex) /opt/%{name}

/opt/%{name}/*

#%config(noreplace) %attr(-,recodex,recodex) %{_sysconfdir}/recodex/worker/config-1.yml
#%{_unitdir}/recodex-web.service
/lib/systemd/system/recodex-web.service

%changelog

