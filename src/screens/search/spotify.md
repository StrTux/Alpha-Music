curl --request GET \
  --url 'https://api.spotify.com/v1/search?q=remaster%2520track%3ADoxy%2520artist%3AMiles%2520Davis&type=album' \
  --header 'Authorization: Bearer 1POdFZRZbvb...qqillRxMr2z'


Search for Item

Get Spotify catalog information about albums, artists, playlists, tracks, shows, episodes or audiobooks that match a keyword string. Audiobooks are only available within the US, UK, Canada, Ireland, New Zealand and Australia markets.
Important policy note

Request

    q
    string
    Required

    Your search query.

    You can narrow down your search using field filters. The available filters are album, artist, track, year, upc, tag:hipster, tag:new, isrc, and genre. Each field filter only applies to certain result types.

    The artist and year filters can be used while searching albums, artists and tracks. You can filter on a single year or a range (e.g. 1955-1960).
    The album filter can be used while searching albums and tracks.
    The genre filter can be used while searching artists and tracks.
    The isrc and track filters can be used while searching tracks.
    The upc, tag:new and tag:hipster filters can only be used while searching albums. The tag:new filter will return albums released in the past two weeks and tag:hipster can be used to return only albums with the lowest 10% popularity.
    Example: q=remaster%2520track%3ADoxy%2520artist%3AMiles%2520Davis
    type
    array of strings
    Required

    A comma-separated list of item types to search across. Search results include hits from all the specified item types. For example: q=abacab&type=album,track returns both albums and tracks matching "abacab".
    Allowed values: "album", "artist", "playlist", "track", "show", "episode", "audiobook"
    market
    string

    An ISO 3166-1 alpha-2 country code. If a country code is specified, only content that is available in that market will be returned.
    If a valid user access token is specified in the request header, the country associated with the user account will take priority over this parameter.
    Note: If neither market or user country are provided, the content is considered unavailable for the client.
    Users can view the country that is associated with their account in the account settings.
    Example: market=ES
    limit
    integer

    The maximum number of results to return in each item type.
    Default: limit=20Range: 0 - 50Example: limit=10
    offset
    integer

    The index of the first result to return. Use with limit to get the next page of search results.
    Default: offset=0Range: 0 - 1000Example: offset=5
    include_external
    string

    If include_external=audio is specified it signals that the client can play externally hosted audio content, and marks the content as playable in the response. By default externally hosted audio content is marked as unplayable in the response.
    Allowed values: "audio"

Response

Search response

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

 




 --------------------------------------------------------------------------


 Response sample

{  "tracks": {    "href": "https://api.spotify.com/v1/me/shows?offset=0&limit=20",    "limit": 20,    "next": "https://api.spotify.com/v1/me/shows?offset=1&limit=1",    "offset": 0,    "previous": "https://api.spotify.com/v1/me/shows?offset=1&limit=1",    "total": 4,    "items": [      {        "album": {          "album_type": "compilation",          "total_tracks": 9,          "available_markets": ["CA", "BR", "IT"],          "external_urls": {            "spotify": "string"          },          "href": "string",          "id": "2up3OPMp9Tb4dAKM2erWXQ",          "images": [            {              "url": "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",              "height": 300,              "width": 300            }          ],          "name": "string",          "release_date": "1981-12",          "release_date_precision": "year",          "restrictions": {            "reason": "market"          },          "type": "album",          "uri": "spotify:album:2up3OPMp9Tb4dAKM2erWXQ",          "artists": [            {              "external_urls": {                "spotify": "string"              },              "href": "string",              "id": "string",              "name": "string",              "type": "artist",              "uri": "string"            }          ]        },        "artists": [          {            "external_urls": {              "spotify": "string"            },            "href": "string",            "id": "string",            "name": "string",            "type": "artist",            "uri": "string"          }        ],        "available_markets": ["string"],        "disc_number": 0,        "duration_ms": 0,        "explicit": false,        "external_ids": {          "isrc": "string",          "ean": "string",          "upc": "string"        },        "external_urls": {          "spotify": "string"        },        "href": "string",        "id": "string",        "is_playable": false,        "linked_from": {        },        "restrictions": {          "reason": "string"        },        "name": "string",        "popularity": 0,        "preview_url": "string",        "track_number": 0,        "type": "track",        "uri": "string",        "is_local": false      }    ]  },  "artists": {    "href": "https://api.spotify.com/v1/me/shows?offset=0&limit=20",    "limit": 20,    "next": "https://api.spotify.com/v1/me/shows?offset=1&limit=1",    "offset": 0,    "previous": "https://api.spotify.com/v1/me/shows?offset=1&limit=1",    "total": 4,    "items": [      {        "external_urls": {          "spotify": "string"        },        "followers": {          "href": "string",          "total": 0        },        "genres": ["Prog rock", "Grunge"],        "href": "string",        "id": "string",        "images": [          {            "url": "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",            "height": 300,            "width": 300          }        ],        "name": "string",        "popularity": 0,        "type": "artist",        "uri": "string"      }    ]  },  "albums": {    "href": "https://api.spotify.com/v1/me/shows?offset=0&limit=20",    "limit": 20,    "next": "https://api.spotify.com/v1/me/shows?offset=1&limit=1",    "offset": 0,    "previous": "https://api.spotify.com/v1/me/shows?offset=1&limit=1",    "total": 4,    "items": [      {        "album_type": "compilation",        "total_tracks": 9,        "available_markets": ["CA", "BR", "IT"],        "external_urls": {          "spotify": "string"        },        "href": "string",        "id": "2up3OPMp9Tb4dAKM2erWXQ",        "images": [          {            "url": "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",            "height": 300,            "width": 300          }        ],        "name": "string",        "release_date": "1981-12",        "release_date_precision": "year",        "restrictions": {          "reason": "market"        },        "type": "album",        "uri": "spotify:album:2up3OPMp9Tb4dAKM2erWXQ",        "artists": [          {            "external_urls": {              "spotify": "string"            },            "href": "string",            "id": "string",            "name": "string",            "type": "artist",            "uri": "string"          }        ]      }    ]  },  "playlists": {    "href": "https://api.spotify.com/v1/me/shows?offset=0&limit=20",    "limit": 20,    "next": "https://api.spotify.com/v1/me/shows?offset=1&limit=1",    "offset": 0,    "previous": "https://api.spotify.com/v1/me/shows?offset=1&limit=1",    "total": 4,    "items": [      {        "collaborative": false,        "description": "string",        "external_urls": {          "spotify": "string"        },        "href": "string",        "id": "string",        "images": [          {            "url": "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",            "height": 300,            "width": 300          }        ],        "name": "string",        "owner": {          "external_urls": {            "spotify": "string"          },          "href": "string",          "id": "string",          "type": "user",          "uri": "string",          "display_name": "string"        },        "public": false,        "snapshot_id": "string",        "tracks": {          "href": "string",          "total": 0        },        "type": "string",        "uri": "string"      }    ]  },  "shows": {    "href": "https://api.spotify.com/v1/me/shows?offset=0&limit=20",    "limit": 20,    "next": "https://api.spotify.com/v1/me/shows?offset=1&limit=1",    "offset": 0,    "previous": "https://api.spotify.com/v1/me/shows?offset=1&limit=1",    "total": 4,    "items": [      {        "available_markets": ["string"],        "copyrights": [          {            "text": "string",            "type": "string"          }        ],        "description": "string",        "html_description": "string",        "explicit": false,        "external_urls": {          "spotify": "string"        },        "href": "string",        "id": "string",        "images": [          {            "url": "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",            "height": 300,            "width": 300          }        ],        "is_externally_hosted": false,        "languages": ["string"],        "media_type": "string",        "name": "string",        "publisher": "string",        "type": "show",        "uri": "string",        "total_episodes": 0      }    ]  },  "episodes": {    "href": "https://api.spotify.com/v1/me/shows?offset=0&limit=20",    "limit": 20,    "next": "https://api.spotify.com/v1/me/shows?offset=1&limit=1",    "offset": 0,    "previous": "https://api.spotify.com/v1/me/shows?offset=1&limit=1",    "total": 4,    "items": [      {        "audio_preview_url": "https://p.scdn.co/mp3-preview/2f37da1d4221f40b9d1a98cd191f4d6f1646ad17",        "description": "A Spotify podcast sharing fresh insights on important topics of the moment—in a way only Spotify can. You’ll hear from experts in the music, podcast and tech industries as we discover and uncover stories about our work and the world around us.",        "html_description": "<p>A Spotify podcast sharing fresh insights on important topics of the moment—in a way only Spotify can. You’ll hear from experts in the music, podcast and tech industries as we discover and uncover stories about our work and the world around us.</p>",        "duration_ms": 1686230,        "explicit": false,        "external_urls": {          "spotify": "string"        },        "href": "https://api.spotify.com/v1/episodes/5Xt5DXGzch68nYYamXrNxZ",        "id": "5Xt5DXGzch68nYYamXrNxZ",        "images": [          {            "url": "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",            "height": 300,            "width": 300          }        ],        "is_externally_hosted": false,        "is_playable": false,        "language": "en",        "languages": ["fr", "en"],        "name": "Starting Your Own Podcast: Tips, Tricks, and Advice From Anchor Creators",        "release_date": "1981-12-15",        "release_date_precision": "day",        "resume_point": {          "fully_played": false,          "resume_position_ms": 0        },        "type": "episode",        "uri": "spotify:episode:0zLhl3WsOCQHbe1BPTiHgr",        "restrictions": {          "reason": "string"        }      }    ]  },  "audiobooks": {    "href": "https://api.spotify.com/v1/me/shows?offset=0&limit=20",    "limit": 20,    "next": "https://api.spotify.com/v1/me/shows?offset=1&limit=1",    "offset": 0,    "previous": "https://api.spotify.com/v1/me/shows?offset=1&limit=1",    "total": 4,    "items": [      {        "authors": [          {            "name": "string"          }        ],        "available_markets": ["string"],        "copyrights": [          {            "text": "string",            "type": "string"          }        ],        "description": "string",        "html_description": "string",        "edition": "Unabridged",        "explicit": false,        "external_urls": {          "spotify": "string"        },        "href": "string",        "id": "string",        "images": [          {            "url": "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",            "height": 300,            "width": 300          }        ],        "languages": ["string"],        "media_type": "string",        "name": "string",        "narrators": [          {            "name": "string"          }        ],        "publisher": "string",        "type": "audiobook",        "uri": "string",        "total_chapters": 0      }    ]  }}