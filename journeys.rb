require 'sinatra'
require 'sinatra/partial'
require 'haml'
#require './meregion'
require 'json'
#$stdout.sync = true

#set :logging, :true
$stdout.sync = true
get '/' do
	partial :index
end

def getRegions
	results = []
	file = File.open("public/all_regions.json","r")
	file.each_line do | line |
		results.push JSON.parse( line )
	end
	file.close
	return results
end

get '/regions.json' do
	#getRegions.to_json
	getRegions.to_json
end

get '/mapnames' do
	results = []
	Dir.foreach('public/maps') do |item|
		if !(item =~ /^[.]/)
			results.push item
		end
	end
	results.to_json
  # do work on real items
end
