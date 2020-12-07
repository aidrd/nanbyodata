#!/usr/bin/perl

use strict;
use warnings;
use feature ':5.10';

use FindBin;
use local::lib "$FindBin::Bin/../local";

use CGI;
use JSON::XS;
use Encode;

my $q = new CGI;
for my $p ($q->param) {
	my @v = map {Encode::decode_utf8($_)} $q->param($p);
	$q->param($p,@v);
}

my $query = $q->param('q');
#my $tsv_file = "$FindBin::Bin/../data/nando_grep.tsv";
#my $json_file = "$FindBin::Bin/../data/nando.json";
my $tsv_file = "$FindBin::Bin/data/nando_grep.tsv";
my $json_file = "$FindBin::Bin/data/nando.json";

open(my $LOG,qq|> $FindBin::Bin/log.txt|);

my $NANDO;
if(defined $query && length $query){
	say $LOG $query;
	open(my $IN, qq{cut -f1,3 $tsv_file | grep $query |});
	while(<$IN>){
		chomp;
		my($id,$val) = split(/\t/);
		$NANDO->{qq|NANDO:$id|} = undef;
	}
	close($IN);
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

my $OUT = {};
my $NANDO_JSNON = &readFileJSON($json_file);
if(defined $NANDO_JSNON && ref $NANDO_JSNON eq 'HASH' && exists $NANDO_JSNON->{'terms'} && defined $NANDO_JSNON->{'terms'} && ref $NANDO_JSNON->{'terms'} eq 'HASH'){
	if(defined $query && length $query){
		my $id = $query;
		$id =~ s/_ja$//g;
		if(exists $NANDO_JSNON->{'terms'}->{$id}){

			my $term = $NANDO_JSNON->{'terms'}->{$id};
#			if($query =~ /_ja$/){
#				$term->{'id'} .= '_ja';
#			}
#			if($query =~ /[\p{Han}\p{Hiragana}\p{Katakana}]/){
#					$term->{'name'} = $term->{'name_ja'}
#				}
#				if(exists $term->{'synonym_ja'} && defined $term->{'synonym_ja'} && length $term->{'synonym_ja'}){
#					$term->{'synonym'} = $term->{'synonym_ja'}
#				}
#			}

			delete $term->{'grep_name'};
			delete $term->{'grep_name_ja'};
			delete $term->{'grep_synonym'};
			delete $term->{'grep_synonym_ja'};

#			delete $term->{'name_ja'};
#			delete $term->{'synonym_ja'};
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
			push(@{$OUT->{'selfclass'}}, $term);
		}
	}
}

say qq|Content-Type: application/json; charset=utf-8\n|;
say &encodeJSON($OUT);
=pod
print<<JSON;
{
  "selfclass": [
    {
      "comment": "", 
      "definition": "A structural anomaly of a CD4-positive, CD25-positive, alpha-beta T cell. These cells are regulatory T cells.", 
      "id": "HP:0030334", 
      "name": "Abnormal CD4-positive, CD25-positive, alpha-beta regulatory T cell morphology", 
      "name_ja": "Abnormal CD4-positive, CD25-positive, alpha-beta regulatory T cell morphology", 
      "synonym": ""
    }
  ], 
  "subclass": [
    {
      "count": 2, 
      "id": "HP:0030335", 
      "name": "Abnormal CD4-positive, CD25-positive, alpha-beta regulatory T cell count", 
      "name_ja": "Abnormal CD4-positive, CD25-positive, alpha-beta regulatory T cell count"
    }
  ], 
  "superclass": [
    {
      "count": 1, 
      "id": "HP:0030333", 
      "name": "Abnormal alpha-beta T cell morphology", 
      "name_ja": "Abnormal alpha-beta T cell morphology"
    }
  ]
}
JSON
=cut
