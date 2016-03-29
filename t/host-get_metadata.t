#!/usr/bin/perl -w
# This test verifies the output of the get_metadata method

use strict;
use warnings;
use FindBin qw($Bin);
use lib "$Bin/lib";
use lib "$Bin/../lib";
use Log::Log4perl qw(:easy);
Log::Log4perl->easy_init( {level => 'OFF'} );

use Test::More tests => 3;

use Config::General;
use Data::Dumper;

use perfSONAR_PS::NPToolkit::DataService::Host;
use perfSONAR_PS::NPToolkit::UnitTests::Util qw( test_result );

my $basedir = 't';
my $config_file = $basedir . '/etc/web_admin.conf';
my $ls_file = $basedir . '/etc/lsregistrationdaemon.conf';
my $conf_obj = Config::General->new( -ConfigFile => $config_file );
my %conf = $conf_obj->getall;

my $data;
my $params = {};
$params->{'config_file'} = $config_file;
$params->{'load_ls_registration'} = 1;
$params->{'ls_config_file'} = $ls_file;

my $info = perfSONAR_PS::NPToolkit::DataService::Host->new( $params );

$data = $info->get_metadata();

warn "data:\n" . Dumper $data;

# check the administrative info

my $expected_admin_info = {
    'administrator' => 
        { 'name' => 'Node Admin',
            'organization' => 'Test Org',
            'email' => 'admin@test.com',
        },
    'location' => {
        'country' => 'US',
        'city' => 'Bloomington',
        'state' => 'IN',
        'zipcode' => '47401',
        'longitude' => '-28.23',
        'latitude' => '123.456',
    },
};

my $admin_info = {};
$admin_info->{'administrator'} = $data->{'administrator'};
$admin_info->{'location'} = $data->{'location'};

test_result($admin_info, $expected_admin_info, "Administrative info data is as expected");


my $expected_communities = [    'Indiana',
                                'perfSONAR',
                                'perfSONAR-PS',
                            ];

my $communities = $data->{'communities'};

test_result($communities, $expected_communities, "Communities are as expected");

# check for expected values under the 'config' section (only interested in a subset)

my $expected_config = {
    'access_policy' => 'public',
    'access_policy_notes' => 'This is a unit test, but feel free to test to it if you like.',
    'check_interval' => '3600',
    'allow_internal_addresses' => 0,
    'role' => 'test-host'
};

my $config = {};
$config->{'access_policy'} = $data->{'config'}->{'access_policy'};
$config->{'access_policy_notes'} = $data->{'config'}->{'access_policy_notes'};
$config->{'check_interval'} = $data->{'config'}->{'check_interval'};
$config->{'allow_internal_addresses'} = $data->{'config'}->{'allow_internal_addresses'};
$config->{'role'} = $data->{'config'}->{'role'};

test_result($config, $expected_config, "Metadata config values are as expected");

