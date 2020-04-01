%define name recovid-web
%define short_name web-app
%define version 1.21.0
%define unmangled_version e148ce468a06b87ad85a65681c45aa4f8edc6b86
%define release 2

Summary: ReCoVid web-app component
Name: %{name}
Version: %{version}
Release: %{release}
License: MIT
Group: Development/Libraries
BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}-buildroot
Prefix: %{_prefix}
Vendor: Petr Stefan <UNKNOWN>
Url: https://github.com/ReCodEx/web-app
BuildRequires: systemd, nodejs >= 10.16.0
Requires(post): systemd
Requires(preun): systemd
Requires(postun): systemd
Requires: nodejs

#Source0: %{name}-%{unmangled_version}.tar.gz
Source0: https://github.com/ReCodEx/%{short_name}/archive/%{unmangled_version}.tar.gz#/%{short_name}-%{unmangled_version}.tar.gz

%define debug_package %{nil}

%description
Web-app of ReCoVid programmer testing solution.

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
cp -r install/recovid-web.service %{buildroot}/lib/systemd/system/recovid-web.service

%clean


%post
%systemd_post 'recovid-web.service'

%postun
%systemd_postun_with_restart 'recovid-web.service'

%pre
getent group recovid >/dev/null || groupadd -r recovid
getent passwd recovid >/dev/null || useradd -r -g recovid -d %{_sysconfdir}/recovid -s /sbin/nologin -c "ReCoVid Code Examiner" recovid
exit 0

%preun
%systemd_preun 'recovid-web.service'

%files
%defattr(-,recovid,recovid)
%dir /opt/%{name}

/opt/%{name}/bin/*
/opt/%{name}/public/*
/opt/%{name}/views/*
%config(noreplace) /opt/%{name}/etc/env.json

#%{_unitdir}/recovid-web.service
%attr(-,root,root) /lib/systemd/system/recovid-web.service

%changelog

