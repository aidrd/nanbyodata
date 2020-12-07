#!/usr/bin/perl

use strict;
use warnings;
use feature ':5.10';

use FindBin;
use local::lib qq|$FindBin::Bin/../local|;
use Unicode::Japanese;
use Encode;

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

while(my $str = <STDIN>){
	print &encodeUTF8(Unicode::Japanese->new(lc(&decodeUTF8($str)))->z2h->get);
}
