#!/usr/bin/perl

use strict;
use warnings;
use feature ':5.10';

use FindBin;
use local::lib "$FindBin::Bin/../local";
use Unicode::Japanese;

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

if(scalar @ARGV){
	my $hash;
	my $child_ids;
	my $versionInfo;
	open(my $IN, $ARGV[0]) or die qq|$ARGV[0] $!|;
	while(<$IN>){
		chomp;
		my($id,$key,$val,$lang) = split(/\t/);
		$versionInfo = &decodeUTF8($val) if($key eq 'versionInfo');
		next unless($id =~ /^NANDO:[0-9]+$/);

		my $decode_val = &decodeUTF8($val);

#		$id = qq|NANDO:$id|;
		unless(exists $hash->{$id}){
			$hash->{$id}= {
				'count_child' => 0,
				'count_parent' => 0
			};
			$hash->{$id}->{'id'} = $id;
		}

		if($key eq 'identifier'){
#			$hash->{$id}->{'id'} = qq|NANDO:$decode_val|;
			$hash->{$id}->{'id'} = $decode_val;
		}
		elsif($key eq 'label'){
			if(defined $lang && $lang =~ /^(ja|en)$/){
				if($lang eq 'en'){
					$hash->{$id}->{'name'} = $decode_val;
					$hash->{$id}->{'grep_name'} = &decodeUTF8(Unicode::Japanese->new(&encodeUTF8(lc($decode_val)))->z2h->get)
				}
				else{
					$hash->{$id}->{'name_ja'} = $decode_val;
					$hash->{$id}->{'grep_name_ja'} = &decodeUTF8(Unicode::Japanese->new(&encodeUTF8(lc($decode_val)))->z2h->get)
				}
			}
			else{
				unless($decode_val =~ /[\p{Han}\p{Hiragana}\p{Katakana}]/){
					$hash->{$id}->{'name'} = $decode_val;
				}
				else{
					$hash->{$id}->{'name_ja'} = $decode_val;
				}
			}
		}
		elsif($key eq 'description'){
			if(defined $lang && $lang =~ /^(ja|en)$/){
				if($lang eq 'en'){
					$hash->{$id}->{'description'} = $decode_val;
				}
				else{
					$hash->{$id}->{'description_ja'} = $decode_val;
				}
			}
			else{
				unless($decode_val =~ /[\p{Han}\p{Hiragana}\p{Katakana}]/){
					$hash->{$id}->{'description'} = $decode_val;
				}
				else{
					$hash->{$id}->{'description_ja'} = $decode_val;
				}
			}
		}
		elsif($key eq 'hasExactSynonym' || $key eq 'altLabel'){
			if(defined $lang && $lang =~ /^(ja|en)$/){
				if($lang eq 'en'){
					push(@{$hash->{$id}->{'synonym'}}, $decode_val);
					$hash->{$id}->{'grep_synonym'} = &decodeUTF8(Unicode::Japanese->new(&encodeUTF8(lc(join(' | ',@{$hash->{$id}->{'synonym'}}))))->z2h->get)
				}
				else{
					push(@{$hash->{$id}->{'synonym_ja'}}, $decode_val);
					$hash->{$id}->{'grep_synonym_ja'} = &decodeUTF8(Unicode::Japanese->new(&encodeUTF8(lc(join(' | ',@{$hash->{$id}->{'synonym_ja'}}))))->z2h->get)
				}
			}
			else{
				unless($decode_val =~ /[\p{Han}\p{Hiragana}\p{Katakana}]/){
					push(@{$hash->{$id}->{'synonym'}}, $decode_val);
				}
				else{
					push(@{$hash->{$id}->{'synonym_ja'}}, $decode_val);
				}
			}
		}
		elsif($key eq 'exactMatch'){
			if($decode_val =~ /^(MONDO)_([0-9]+)$/){
				$decode_val = qq|$1:$2|;
				push(@{$hash->{$id}->{'xref'}}, {
					'name' => $decode_val,
					'acc' => $decode_val,
					'db' => 'MONDO'
				});
			}
			else{
				push(@{$hash->{$id}->{'xref'}}, {
					'acc' => $decode_val
				});
			}
		}
		elsif($key eq 'subClassOf' && $decode_val =~ /^NANDO:[0-9]+$/){
#			my $parent_id = qq|NANDO:$decode_val|;
			my $parent_id = $decode_val;
			push(@{$hash->{$id}->{'parent_ids'}}, $parent_id);
			$hash->{$id}->{'count_parent'} = scalar @{$hash->{$id}->{'parent_ids'}};
			$child_ids->{$parent_id}->{$id} = undef;
		}
		elsif($key eq 'seeAlso'){
			push(@{$hash->{$id}->{$key}}, $decode_val);
		}
		else{
			if(exists $hash->{$id}->{$key}){
				unless(ref $hash->{$id}->{$key} eq 'ARRAY'){
					my $temp = $hash->{$id}->{$key};
					$hash->{$id}->{$key} = [$temp,$decode_val];
				}
				else{
					push(@{$hash->{$id}->{$key}}, $decode_val);
				}
			}
			else{
				$hash->{$id}->{$key} = $decode_val;
			}
		}
	#	say sprintf(qq|%s\t%s\t%d\t%d|, &encodeUTF8($val), $val, length($val), &Encode::is_utf8($val) ? 1 : 0);
	}
	close($IN);

	if(defined $child_ids){
		foreach my $parent_id (keys(%{$child_ids})){
			next unless(exists $hash->{$parent_id});
			$hash->{$parent_id}->{'child_ids'} = [sort keys(%{$child_ids->{$parent_id}})];
			$hash->{$parent_id}->{'count_child'} = scalar @{$hash->{$parent_id}->{'child_ids'}};
		}
	}

	$versionInfo = $ARGV[0] unless(defined $versionInfo && length $versionInfo);
		say &encodeJSON({'version' => $versionInfo, 'terms' => $hash},1);
#	}
#	else{
#		say &encodeJSON($hash,1);
#	}
}
