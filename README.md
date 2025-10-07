# govuk-looker-data-access

## Getting Started with Code Examples
Run a simple app on your local machine that demonstrates accessing data stored in Looker from an external process/application.

### Install
`npm install`

### Configure
```shell
LOOKERSDK_BASE_URL=#the URL of the Looker instance#
LOOKERSDK_CLIENT_ID=#The client ID of the API key created by a Looker admin#
LOOKERSDK_CLIENT_SECRET=#The client secret of the API key created by a Looker admin#
LOOKERSDK_VERIFY_SSL=True
```
### Run
`npm run dev`

## Scope of the Spike
This repo documents the work from a [spike](https://gov-uk.atlassian.net/browse/IA-1702) into accessing data stored in Looker via external applications.

## Looker configuration
:bulb: You can you use the Looker [API Explorer extension](https://cloud.google.com/looker/docs/api-explorer) to try out the APIs available to Developers.

### Provisioning programmatic access via API keys
API keys are required for every method of access except Public and Private Embedding.
Programmatic access via an application requires a "Standard User" and the creation of API keys associated with that user.

Setting up Standard Users via the UI requires an email address so we would need to think about creating service account users which have an email - would a Google Group work? Or is there some other way to create an API-only user that is not tied to an email address? Either way API keys can then be created for that user and securely shared for use in that application. They must be managed by that application as sensitive secrets.

:bulb: perhaps a specific `API_USER` role might be desirable to enforce new API users with the minimum necessary permissions for known uue-cases.
- what are the minimum permissions required? `[access_data, see_looks]`?
- what are the configuration options - click-ops by an admin, terraform, create a manager app which itself uses the Looker API to administer it?

### Configuration required for embedding
The Admin -> Platform -> Embed section of Looker has many settings to configure embedding.
At a minimum you need a Looker admin to:
- Add the domain hosting the page to the Embedded Domain Allowlist

## Integration Options

### Get data directly from an Explore defined in LookML
[docs](https://cloud.google.com/looker/docs/reference/looker-api/latest/methods/Query/run_inline_query)
- Allows a metric from the semantic layer to be used directly
- Allows the external app to decide which dimensions and filters are relevant to their use-case

### Get data from a Look that has been curated and pre-built on top of an Explore in Looker via run_look
[docs](https://cloud.google.com/looker/docs/reference/looker-api/latest/methods/Look/run_look)
- Looker developers have full control over how the metric is exposed
- The structure of data within a Look can vary greatly depending on the visualisation. Potentially a brittle interface.
- You can be really specific about what is intended to be exposed to the API
- It might be better to "push" some of the logic used to create the Look back up into the Semantic Layer if possible (i.e. the Explore)

### Embed visual content built in Looker into an external application
#### Embed an iframe via Public Access
[docs](https://cloud.google.com/looker/docs/publishing-looks-with-public-urls#enabling_public_access_for_a_specific_look)
- Very simple to setup if data is genuinely intended for public use
- Requires "Public Access" admin setting to be enabled. Visualisations are still private by default but this allows selected Looks and Dashboards to be explicitly made public.
- No frontend javascript required

#### Embed an iframe via Private Embedding
[docs](https://cloud.google.com/looker/docs/private-embedding)
- End-users require a Looker account
- Very simple dev process
- No additional security considerations other than built-in Looker access controls
- No need to manage separate service account credentials
- No frontend javascript required

#### Embed an iframe via Signed Embedding
[docs](https://cloud.google.com/looker/docs/signed-embedding)
- End-users do not require a Looker account
- "Service account" admin process needs to be implemented
- More complex dev process as signed-URLs are generated dynamically by external application code
- More risk from an InfoSec perspective as slightly less control over access configuration from external applications compared to Private Embedding
- Front-end javascript code required
- These [docs](https://cloud.google.com/looker/docs/signed-embedding#using_the_create_signed_embed_url_api_endpoint) suggest the service account must have admin permissions :thinking:...

#### Embed using OAuth/SSO
[docs](https://cloud.google.com/looker/docs/api-cors)
There seems to be an option to configure "Embed Users" which are different from Standard Users (who are required to log in to Looker).
This approach seems similar to "Signed Embedding" except that an OAuth provider (such as Signon) provides authentication linked to a specific user's profile and access requirements. "Signed Embedding" just serves up the content the service account has permission to access whereas this method would allow experiences customised to the logged in user.

#### Connecting Looker Studio to an Explore
[docs](https://cloud.google.com/looker/docs/studio/connect-to-looker)
It's click-ops driven to setup the integration and uses the viewer's credentials so no additional service accounts are required.
It seems by far the simplest way to integrate with an Explore and the docs seem to cover everything.

#### Scheduling Exports
[docs](https://cloud.google.com/looker/docs/scheduling)
- Effectively "Push notifications" via email, webhook, Slack, S3 buckets etc...

## Some considerations specific to the Polling metrics
The Explore approach becomes very complicated with polling data. It highlights an important differentiation between analyst and developer use-cases and the importance of capturing them during development of the semantic layer.
The main point I would make is to put as much in the semantic layer as possible. A metric in the semantic layer will be easily used by both analysts and developers but will require more work and understanding of what is important to users of the data.

In terms of polling data. It may be worth adding a couple of things to the ingestion to address.
- add `percentage_of` measure to LookML
- add a "positivity" dimension (grouping Strongly Agree, Agree etc... based on the context of the question.)
- always expose the full ISO date of the survey wave

## Key Takeaways
- need to solve the problem of how "service accounts" with an email address are provisioned within Looker.
- need to put thought into "service account" role permissions
- move as much processing logic as possible upstream (data modelling pipelines and LookML)
- The return formats from the Explore- and Look- based API endpoints are interchangeable in many cases. That is not true if a Look is built using "Grouped values" and there are edge-cases involving pivots.
- Allowing filtering by user-provided values will be a challenge with the "data" APIs. You would need to populate the values of those components by querying Looker or maintain a static list.


## Links
[GDS Looker instance](https://gds.cloud.looker.com/)
[Semantic Layer](https://github.com/alphagov/gds-looker)
[Looker API Explorer docs](https://cloud.google.com/looker/docs/api-explorer)
[Looker API Explorer](https://gds.cloud.looker.com/extensions/marketplace_extension_api_explorer::api-explorer/4.0/)
[Looker API docs](https://cloud.google.com/looker/docs/reference/looker-api/latest)
