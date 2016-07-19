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
	file = File.open("regions.tsv","r")
	headings = file.readline().strip().split("\t")
	index = 0
	file.each_line do | line |
		entry = {"id":index}
		index += 1
		values = line.strip().split("\t")
		if( true )
			values.each_with_index do | val, i |
				entry[headings[i]] = val
			end
			entry["cells"] = entry["cells"].split(';')
			entry["cells"] = entry["cells"].collect{|x| {"q"=>x.split(",")[0].to_i, "r"=>x.split(",")[1].to_i}}
			results.push entry
		end
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
