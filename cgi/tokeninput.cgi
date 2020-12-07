#!/usr/bin/perl

use strict;
use warnings;
use feature ':5.10';

use FindBin;
use local::lib "$FindBin::Bin/../local";
use Unicode::Japanese;

use CGI;
use JSON::XS;
use Encode;

use Data::Dumper;
$Data::Dumper::Indent = 1;
$Data::Dumper::Sortkeys = 1;

my $q = new CGI;
for my $p ($q->param) {
	my @v = map {&decodeUTF8($_)} $q->param($p);
	$q->param($p,@v);
}

my $query = $q->param('q');
my $grep_query;
#my $tsv_file = "$FindBin::Bin/../data/nando_grep.tsv";
#my $json_file = "$FindBin::Bin/../data/nando.json";
my $tsv_file = "$FindBin::Bin/data/nando_grep.tsv";
my $json_file = "$FindBin::Bin/data/nando.json";

open(my $LOG,qq|> $FindBin::Bin/log.txt|);
print $LOG &Data::Dumper::Dumper(\%ENV);

my $NANDO;
if(defined $query && length $query){
	say $LOG $query;
	my $space = &decodeUTF8('　');
	$query =~ s/$space/ /g;
	my $is_ja = undef;
	if($query =~ /[\p{Han}\p{Hiragana}\p{Katakana}]/){
		$is_ja = 1;
	}

	$grep_query = Unicode::Japanese->new(lc($query))->z2h->get;

	$grep_query =~ s/ {2,}/ /g;
	$grep_query =~ s/^ +//g;
	$grep_query =~ s/ +$//g;

	my $cmd = qq{cat $tsv_file |};
	foreach my $val (split(" ",$grep_query)){
		$cmd .= qq{grep -i "$val" |};
	}
	say $LOG $cmd;
	open(my $IN, $cmd);
	while(<$IN>){
		chomp;
		say $LOG $_;
		my($id,$val) = split(/\t/);
#		$NANDO->{qq|NANDO:$id|} = undef;
		$NANDO->{uc($id)} = undef;
#		unless(defined $NANDO->{$id}){
#			$is_ja = (&decodeUTF8($val) =~ /[\p{Han}\p{Hiragana}\p{Katakana}]/ ? 1 : undef);
#		}
#		$NANDO->{$id} = $is_ja;
	}
	close($IN);
}

$grep_query = &decodeUTF8($grep_query) if(defined $grep_query && length $grep_query);

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

my $JSONXS = JSON::XS->new->utf8->indent(0)->canonical(1);#->relaxed(0);
my $JSONXS_Extensions  = JSON::XS->new->utf8->indent(1)->canonical(1)->relaxed(1);
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

sub readFileJSON {
	my $file_path = shift;
	my $json;
	eval{
		if(defined $file_path && -e $file_path && -r $file_path && -s $file_path){
			local $/ = undef;
			open(my $IN,$file_path) or die __FILE__.':'.__LINE__.':'.$!.qq|[$file_path]|;
			flock($IN,1);
			$json = &decodeExtensionsJSON(<$IN>);
			close($IN);
		}else{
#			say STDERR __LINE__.':'.$file_path;
		}
	};
	warn $@,"\n" if($@);
	return $json;
}

my $OUT = [];
my $NANDO_JSON = &readFileJSON($json_file);
if(defined $NANDO_JSON && ref $NANDO_JSON eq 'HASH' && exists $NANDO_JSON->{'terms'} && defined $NANDO_JSON->{'terms'} && ref $NANDO_JSON->{'terms'} eq 'HASH'){
	if(defined $NANDO && ref $NANDO eq 'HASH'){
#print $LOG &Data::Dumper::Dumper($NANDO);
		my $grep_query_arr = [split(" ",$grep_query)];
		foreach my $id (sort keys(%$NANDO)){
			next unless(exists $NANDO_JSON->{'terms'}->{$id});

			my $term = $NANDO_JSON->{'terms'}->{$id};
#print $LOG &Data::Dumper::Dumper($term);

#			my $is_ja = $NANDO->{$id};
			my $is_ja = 0;
			my $HTTP_ACCEPT_LANGUAGE = exists $ENV{'HTTP_ACCEPT_LANGUAGE'} && defined $ENV{'HTTP_ACCEPT_LANGUAGE'} && index($ENV{'HTTP_ACCEPT_LANGUAGE'},'ja')==0 ? 1 : 0;
#			my $HTTP_ACCEPT_LANGUAGE = 0;

			if(1 || $HTTP_ACCEPT_LANGUAGE){
				foreach my $grep_query_value (@{$grep_query_arr}){
					$is_ja = exists $term->{'grep_name_ja'} && defined $term->{'grep_name_ja'} && index($term->{'grep_name_ja'},$grep_query_value)>=0 ? 1 : 0;
					last unless($is_ja);
				}
				unless($is_ja){
					foreach my $grep_query_value (@{$grep_query_arr}){
						$is_ja = exists $term->{'grep_synonym_ja'} && defined $term->{'grep_synonym_ja'} && index($term->{'grep_synonym_ja'},$grep_query_value)>=0 ? 2 : 0;
						last unless($is_ja);
					}
				}
			}
			unless($is_ja){
				foreach my $grep_query_value (@{$grep_query_arr}){
					$is_ja = exists $term->{'grep_name'} && defined $term->{'grep_name'} && index($term->{'grep_name'},$grep_query_value)>=0 ? -1 : 0;
					last unless($is_ja);
				}
			}
			unless($is_ja){
				foreach my $grep_query_value (@{$grep_query_arr}){
					$is_ja = exists $term->{'grep_synonym'} && defined $term->{'grep_synonym'} && index($term->{'grep_synonym'},$grep_query_value)>=0 ? -2 : 0;
					last unless($is_ja);
				}
			}
			unless($is_ja){
				$is_ja = $HTTP_ACCEPT_LANGUAGE;
			}
#print $LOG &Data::Dumper::Dumper($is_ja);


#			if($query =~ /[\p{Han}\p{Hiragana}\p{Katakana}]/){
			if($is_ja==1 && exists $term->{'name_ja'} && defined $term->{'name_ja'} && length $term->{'name_ja'}){
				$term->{'name'} = $term->{'name_ja'};
				$term->{'id'} .= '_ja' if($HTTP_ACCEPT_LANGUAGE);
				delete $term->{'synonym'};
			}
			elsif($is_ja==2 && exists $term->{'synonym_ja'} && defined $term->{'synonym_ja'} && ref $term->{'synonym_ja'} eq 'ARRAY' && scalar @{$term->{'synonym_ja'}}){
				$term->{'name'} = $term->{'name_ja'} if($HTTP_ACCEPT_LANGUAGE==1 && exists $term->{'name_ja'} && defined $term->{'name_ja'} && length $term->{'name_ja'});
				$term->{'synonym'} = $term->{'synonym_ja'};
			}
			else{
#				$term->{'name'} = $term->{'name_ja'} unless(exists $term->{'name'} && defined $term->{'name'} && length $term->{'name'});
#				$term->{'synonym'} = $term->{'synonym_ja'} unless(exists $term->{'synonym'} && defined $term->{'synonym'} && ref $term->{'synonym'} eq 'ARRAY' && scalar @{$term->{'synonym'}});

				$term->{'name'} = $term->{'name_ja'} unless(exists $term->{'name'} && defined $term->{'name'} && length $term->{'name'});

				unless($is_ja==-2){
					delete $term->{'synonym'};
				}
			}

#			say $LOG sprintf("%s\t%s",&encodeUTF8($name),&encodeUTF8($grep_query));
#			delete $term->{'synonym'} if(index($name,$grep_query)>=0);

			delete $term->{'grep_name'};
			delete $term->{'grep_name_ja'};
			delete $term->{'grep_synonym'};
			delete $term->{'grep_synonym_ja'};

			delete $term->{'name_ja'};
			delete $term->{'synonym_ja'};
			delete $term->{'definition'};
			delete $term->{'definition_ja'};
			delete $term->{'child_ids'};
			delete $term->{'count_child'};
			delete $term->{'count_parent'};
			delete $term->{'has_notification_number'};
			delete $term->{'isDefinedBy'};
			delete $term->{'parent_ids'};
			delete $term->{'prefLabel'};
			delete $term->{'seeAlso'};
			delete $term->{'subClassOf'};
			delete $term->{'type'};
			delete $term->{'xref'};
			push(@$OUT, $term);
		}
	}
}

say qq|Content-Type: application/json; charset=utf-8\n|;
say &encodeJSON($OUT);
