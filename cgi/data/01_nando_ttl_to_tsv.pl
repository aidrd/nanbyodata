#!/usr/bin/perl

use strict;
use warnings;
use feature ':5.10';

#use RDF::Simple::Parser;

use Encode;
use Data::Dumper;
$Data::Dumper::Indent = 1;
$Data::Dumper::Sortkeys = 1;

use JSON::XS;
my $JSONXS;
my $JSONXS_Extensions;

BEGIN{
	$JSONXS = JSON::XS->new->utf8->indent(0)->canonical(1);#->relaxed(0);
	$JSONXS_Extensions  = JSON::XS->new->utf8->indent(1)->canonical(1)->relaxed(1);
};

sub message {
	my $str = shift;
	my $fh = shift // \*STDERR;
	my($package, $file, $line, $subname, $hasargs, $wantarray, $evaltext, $is_require) = caller();
	eval{
		$str = '' unless(defined $str && length $str);
		if(ref $str eq 'HASH' || ref $str eq 'ARRAY'){
			say $fh $package.':'.$line.':'.&encodeJSON($str,1);
		}elsif(ref $str ne ''){
			print $fh $package.':'.$line.':'.&Data::Dumper::Dumper($str);
		}else{
			say $fh $package.':'.$line.':'.&encodeUTF8($str);
		}
	};
	if($@){
		say $fh $package.':'.$line.':'.&encodeUTF8($@);
	}
}

sub dumper {
	my $obj = shift;
	my $fh = shift // \*STDERR;
	my($package, $file, $line, $subname, $hasargs, $wantarray, $evaltext, $is_require) = caller();
	print $fh $package.':'.$line.':'.&Data::Dumper::Dumper($obj);
}

sub decodeUTF8 {
	my $str = shift;
	return $str unless(defined $str && length $str);
	$str = &Encode::decode_utf8($str) unless(&Encode::is_utf8($str));
	return $str;
}

sub encodeUTF8 {
	my $str = shift;
	return $str unless(defined $str && length $str);
	$str = &Encode::encode_utf8($str) if(&Encode::is_utf8($str));
	return $str;
}

sub decodeJSON {
	my $json_str = shift;
	my $ext = shift;
	my $json;
	return $json unless(defined $json_str && length $json_str);
	$ext = 1 unless(defined $ext);
	$json_str = &encodeUTF8($json_str);
	eval{$json = $ext ? $JSONXS_Extensions->decode($json_str) : $JSONXS->decode($json_str);};
	if($@){
		say STDERR __FILE__.':'.__LINE__.':'.$@;
		say STDERR __FILE__.':'.__LINE__.':'.$json_str;
	}
	return $json;
}

sub decodeExtensionsJSON {
	my $json_str = shift;
	return &decodeJSON($json_str,1);
}

sub encodeJSON {
	my $json = shift;
	my $ext = shift;
	$ext = 0 unless(defined $ext);
	my $json_str;
	eval{$json_str = $ext ? $JSONXS_Extensions->encode($json) : $JSONXS->encode($json);};
	if($@){
		say STDERR __FILE__.':'.__LINE__.':'.$@ ;
		my($package, $file, $line, $subname, $hasargs, $wantarray, $evaltext, $is_require) = caller();
		say STDERR $package.':'.$line;
	}

	return $json_str;
}

sub encodeExtensionsJSON {
	my $json = shift;
	return &encodeJSON($json,1);
}

#grep -e "^:[0-9]" -e "rdfs:label" -e "skos:altLabel" -e "terms:description" nando_20200503.ttl | less

if(scalar @ARGV){
	foreach my $argv (@ARGV){
		my $id;
		my $key;
		my $val;
		my $lang;
		open(my $IN, $argv) or die qq|$! [$argv]|;
		while(<$IN>){
			chomp;
			next unless(length($_));
			$_ = &decodeUTF8($_);
			if(/^:([0-9]+)$/){
				$id = $1;
				next;
			}
			next unless(defined $id);

			if(/^\s+(rdfs:label|skos:altLabel|terms:description)\s+\"(.+)\"\@(ja|en)/){
				$key = (split(/:/,$1))[1];
				$val = $2;
				$lang = $3;
				say qq|NANDO:$id\t$key\t|.&encodeUTF8($val).qq|\t$lang|;
			}
			elsif(/^\s+rdfs:(subClassOf)\s*:([0-9]+)/){
				$key = $1;
				$val = $2;
				say qq|NANDO:$id\t$key\tNANDO:$val|;
			}
			elsif(/^\s+\"(.+)\"\@(ja|en)/){
				$val = $1;
				$lang = $2;
				say qq|NANDO:$id\t$key\t|.&encodeUTF8($val).qq|\t$lang|;
			}
			if(/\;$/){
				undef $key;
				undef $val;
				undef $lang;
			}
			elsif(/\,$/){
				undef $val;
				undef $lang;
			}
			elsif(/\.$/){
				undef $id;
				undef $key;
				undef $val;
				undef $lang;
			}
		}
		close($IN);
	}
}
