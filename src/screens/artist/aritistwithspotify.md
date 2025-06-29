Get Artist

Get Spotify catalog information for a single artist identified by their unique Spotify ID.
Important policy notes

Request

    id
    string
    Required

    The Spotify ID of the artist.
    Example: 0TnOYISbd1XYRBk9myaseg

Response

An artist

Known external URLs for this artist.

    spotify
    string

    The Spotify URL for the object.

Information about the followers of the artist.

    href
    string
    Nullable

    This will always be set to null, as the Web API does not support it at the moment.
    total
    integer

    The total number of followers.

genres
array of strings

A list of the genres the artist is associated with. If not yet classified, the array is empty.
Example: ["Prog rock","Grunge"]
href
string

A link to the Web API endpoint providing full details of the artist.
id
string

The Spotify ID for the artist.

Images of the artist in various sizes, widest first.

    url
    string
    Required

    The source URL of the image.
    Example: "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228"
    height
    integer
    Required
    Nullable

    The image height in pixels.
    Example: 300
    width
    integer
    Required
    Nullable

    The image width in pixels.
    Example: 300

name
string

The name of the artist.
popularity
integer

The popularity of the artist. The value will be between 0 and 100, with 100 being the most popular. The artist's popularity is calculated from the popularity of all the artist's tracks.
type
string

The object type.
Allowed values: "artist"
uri
string

The Spotify URI for the artist.



endpointhttps://api.spotify.com/v1/artists/{id}id
id --  





Web API •References / Artists / Get Several Artists
Get Several Artists

Get Spotify catalog information for several artists based on their Spotify IDs.
Important policy notes

Request

    ids
    string
    Required

    A comma-separated list of the Spotify IDs for the artists. Maximum: 50 IDs.
    Example: ids=2CIMQHirSU0MQqyYHq0eOx,57dN52uHvrHOxijzpIgu3E,1vCWHaC5f2uS3yhpwWbIA6

Response

A set of artists

Required

Known external URLs for this artist.

Information about the followers of the artist.
genres
array of strings

A list of the genres the artist is associated with. If not yet classified, the array is empty.
Example: ["Prog rock","Grunge"]
href
string

A link to the Web API endpoint providing full details of the artist.
id
string

The Spotify ID for the artist.

Images of the artist in various sizes, widest first.
name
string

The name of the artist.
popularity
integer

The popularity of the artist. The value will be between 0 and 100, with 100 being the most popular. The artist's popularity is calculated from the popularity of all the artist's tracks.
type
string

The object type.
Allowed values: "artist"
uri
string

The Spotify URI for the artist.  




endpointhttps://api.spotify.com/v1/artists


ids  ---   



Get Artist's Albums

Get Spotify catalog information about an artist's albums.
Important policy notes

Request

    id
    string
    Required

    The Spotify ID of the artist.
    Example: 0TnOYISbd1XYRBk9myaseg
    include_groups
    string

    A comma-separated list of keywords that will be used to filter the response. If not supplied, all album types will be returned.
    Valid values are:
    - album
    - single
    - appears_on
    - compilation
    For example: include_groups=album,single.
    Example: include_groups=single,appears_on
    market
    string

    An ISO 3166-1 alpha-2 country code. If a country code is specified, only content that is available in that market will be returned.
    If a valid user access token is specified in the request header, the country associated with the user account will take priority over this parameter.
    Note: If neither market or user country are provided, the content is considered unavailable for the client.
    Users can view the country that is associated with their account in the account settings.
    Example: market=ES
    limit
    integer

    The maximum number of items to return. Default: 20. Minimum: 1. Maximum: 50.
    Default: limit=20Range: 0 - 50Example: limit=10
    offset
    integer

    The index of the first item to return. Default: 0 (the first item). Use with limit to get the next set of items.
    Default: offset=0Example: offset=5

Response

Pages of albums

    href
    string
    Required

    A link to the Web API endpoint returning the full result of the request
    Example: "https://api.spotify.com/v1/me/shows?offset=0&limit=20"
    limit
    integer
    Required

    The maximum number of items in the response (as set in the query or by default).
    Example: 20
    next
    string
    Required
    Nullable

    URL to the next page of items. ( null if none)
    Example: "https://api.spotify.com/v1/me/shows?offset=1&limit=1"
    offset
    integer
    Required

    The offset of the items returned (as set in the query or by default)
    Example: 0
    previous
    string
    Required
    Nullable

    URL to the previous page of items. ( null if none)
    Example: "https://api.spotify.com/v1/me/shows?offset=1&limit=1"
    total
    integer
    Required

    The total number of items available to return.
    Example: 4

Required

    album_type
    string
    Required

    The type of the album.
    Allowed values: "album", "single", "compilation"Example: "compilation"
    total_tracks
    integer
    Required

    The number of tracks in the album.
    Example: 9
    available_markets
    array of strings
    Required

    The markets in which the album is available: ISO 3166-1 alpha-2 country codes. NOTE: an album is considered available in a market when at least 1 of its tracks is available in that market.
    Example: ["CA","BR","IT"]

Required

Known external URLs for this album.
href
string
Required

A link to the Web API endpoint providing full details of the album.
id
string
Required

The Spotify ID for the album.
Example: "2up3OPMp9Tb4dAKM2erWXQ"
Required

The cover art for the album in various sizes, widest first.
name
string
Required

The name of the album. In case of an album takedown, the value may be an empty string.
release_date
string
Required

The date the album was first released.
Example: "1981-12"
release_date_precision
string
Required

The precision with which release_date value is known.
Allowed values: "year", "month", "day"Example: "year"

Included in the response when a content restriction is applied.
type
string
Required

The object type.
Allowed values: "album"
uri
string
Required

The Spotify URI for the album.
Example: "spotify:album:2up3OPMp9Tb4dAKM2erWXQ"
Required

The artists of the album. Each artist object includes a link in href to more detailed information about the artist.
album_group
string
Required

This field describes the relationship between the artist and the album.
Allowed values: "album", "single", "compilation", "appears_on"Example: "compilation"


endpointhttps://api.spotify.com/v1/artists/{id}/albums

id
market 
limit
offset



--------------------------


Get Artist's Top Tracks

Get Spotify catalog information about an artist's top tracks by country.
Important policy notes

Request

    id
    string
    Required

    The Spotify ID of the artist.
    Example: 0TnOYISbd1XYRBk9myaseg
    market
    string

    An ISO 3166-1 alpha-2 country code. If a country code is specified, only content that is available in that market will be returned.
    If a valid user access token is specified in the request header, the country associated with the user account will take priority over this parameter.
    Note: If neither market or user country are provided, the content is considered unavailable for the client.
    Users can view the country that is associated with their account in the account settings.
    Example: market=ES

Response

A set of tracks

Required

The album on which the track appears. The album object includes a link in href to full information about the album.

The artists who performed the track. Each artist object includes a link in href to more detailed information about the artist.
available_markets
array of strings

A list of the countries in which the track can be played, identified by their ISO 3166-1 alpha-2 code.
disc_number
integer

The disc number (usually 1 unless the album consists of more than one disc).
duration_ms
integer

The track length in milliseconds.
explicit
boolean

Whether or not the track has explicit lyrics ( true = yes it does; false = no it does not OR unknown).

Known external IDs for the track.

Known external URLs for this track.
href
string

A link to the Web API endpoint providing full details of the track.
id
string

The Spotify ID for the track.
is_playable
boolean

Part of the response when Track Relinking is applied. If true, the track is playable in the given market. Otherwise false.

Part of the response when Track Relinking is applied, and the requested track has been replaced with different track. The track in the linked_from object contains information about the originally requested track.

Included in the response when a content restriction is applied.
name
string

The name of the track.
popularity
integer

The popularity of the track. The value will be between 0 and 100, with 100 being the most popular.
The popularity of a track is a value between 0 and 100, with 100 being the most popular. The popularity is calculated by algorithm and is based, in the most part, on the total number of plays the track has had and how recent those plays are.
Generally speaking, songs that are being played a lot now will have a higher popularity than songs that were played a lot in the past. Duplicate tracks (e.g. the same track from a single and an album) are rated independently. Artist and album popularity is derived mathematically from track popularity. Note: the popularity value may lag actual popularity by a few days: the value is not updated in real time.
preview_url
string
Nullable
Deprecated

A link to a 30 second preview (MP3 format) of the track. Can be null
Important policy note

track_number
integer

The number of the track. If an album has several discs, the track number is the number on the specified disc.
type
string

The object type: "track".
Allowed values: "track"
uri
string

The Spotify URI for the track.
is_local
boolean

Whether or not the track is from a local file.



endpointhttps://api.spotify.com/v1/artists/{id}/top-tracks


id 
market 

Get Artist's Related Artists
Deprecated

Get Spotify catalog information about artists similar to a given artist. Similarity is based on analysis of the Spotify community's listening history.
Important policy notes

Request

    id
    string
    Required

    The Spotify ID of the artist.
    Example: 0TnOYISbd1XYRBk9myaseg

Response

A set of artists

Required

Known external URLs for this artist.

Information about the followers of the artist.
genres
array of strings

A list of the genres the artist is associated with. If not yet classified, the array is empty.
Example: ["Prog rock","Grunge"]
href
string

A link to the Web API endpoint providing full details of the artist.
id
string

The Spotify ID for the artist.

Images of the artist in various sizes, widest first.
name
string

The name of the artist.
popularity
integer

The popularity of the artist. The value will be between 0 and 100, with 100 being the most popular. The artist's popularity is calculated from the popularity of all the artist's tracks.
type
string

The object type.
Allowed values: "artist"
uri
string

The Spotify URI for the artist.   


