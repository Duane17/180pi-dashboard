"use client"
import { useState } from "react"
import { SelectInput } from "./SelectInput"
import { FormTextInput } from "./FormTextInput"
import { Plus, X, MapPin } from "lucide-react"

interface SiteLocation {
  id: string
  country: string
  city: string
  description: string
}

interface LocationData {
  headquartersCountry: string
  siteLocations: SiteLocation[]
}

interface StepLocationProps {
  data: LocationData
  onChange: (data: LocationData) => void
  errors?: Partial<Record<keyof LocationData, string>>
}

// ISO-3166 country codes with names
const countries = [
  { value: "AD", label: "Andorra" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "AF", label: "Afghanistan" },
  { value: "AG", label: "Antigua and Barbuda" },
  { value: "AI", label: "Anguilla" },
  { value: "AL", label: "Albania" },
  { value: "AM", label: "Armenia" },
  { value: "AO", label: "Angola" },
  { value: "AQ", label: "Antarctica" },
  { value: "AR", label: "Argentina" },
  { value: "AS", label: "American Samoa" },
  { value: "AT", label: "Austria" },
  { value: "AU", label: "Australia" },
  { value: "AW", label: "Aruba" },
  { value: "AX", label: "Åland Islands" },
  { value: "AZ", label: "Azerbaijan" },
  { value: "BA", label: "Bosnia and Herzegovina" },
  { value: "BB", label: "Barbados" },
  { value: "BD", label: "Bangladesh" },
  { value: "BE", label: "Belgium" },
  { value: "BF", label: "Burkina Faso" },
  { value: "BG", label: "Bulgaria" },
  { value: "BH", label: "Bahrain" },
  { value: "BI", label: "Burundi" },
  { value: "BJ", label: "Benin" },
  { value: "BL", label: "Saint Barthélemy" },
  { value: "BM", label: "Bermuda" },
  { value: "BN", label: "Brunei Darussalam" },
  { value: "BO", label: "Bolivia" },
  { value: "BQ", label: "Bonaire, Sint Eustatius and Saba" },
  { value: "BR", label: "Brazil" },
  { value: "BS", label: "Bahamas" },
  { value: "BT", label: "Bhutan" },
  { value: "BV", label: "Bouvet Island" },
  { value: "BW", label: "Botswana" },
  { value: "BY", label: "Belarus" },
  { value: "BZ", label: "Belize" },
  { value: "CA", label: "Canada" },
  { value: "CC", label: "Cocos (Keeling) Islands" },
  { value: "CD", label: "Congo, Democratic Republic of the" },
  { value: "CF", label: "Central African Republic" },
  { value: "CG", label: "Congo" },
  { value: "CH", label: "Switzerland" },
  { value: "CI", label: "Côte d'Ivoire" },
  { value: "CK", label: "Cook Islands" },
  { value: "CL", label: "Chile" },
  { value: "CM", label: "Cameroon" },
  { value: "CN", label: "China" },
  { value: "CO", label: "Colombia" },
  { value: "CR", label: "Costa Rica" },
  { value: "CU", label: "Cuba" },
  { value: "CV", label: "Cabo Verde" },
  { value: "CW", label: "Curaçao" },
  { value: "CX", label: "Christmas Island" },
  { value: "CY", label: "Cyprus" },
  { value: "CZ", label: "Czechia" },
  { value: "DE", label: "Germany" },
  { value: "DJ", label: "Djibouti" },
  { value: "DK", label: "Denmark" },
  { value: "DM", label: "Dominica" },
  { value: "DO", label: "Dominican Republic" },
  { value: "DZ", label: "Algeria" },
  { value: "EC", label: "Ecuador" },
  { value: "EE", label: "Estonia" },
  { value: "EG", label: "Egypt" },
  { value: "EH", label: "Western Sahara" },
  { value: "ER", label: "Eritrea" },
  { value: "ES", label: "Spain" },
  { value: "ET", label: "Ethiopia" },
  { value: "FI", label: "Finland" },
  { value: "FJ", label: "Fiji" },
  { value: "FK", label: "Falkland Islands (Malvinas)" },
  { value: "FM", label: "Micronesia" },
  { value: "FO", label: "Faroe Islands" },
  { value: "FR", label: "France" },
  { value: "GA", label: "Gabon" },
  { value: "GB", label: "United Kingdom" },
  { value: "GD", label: "Grenada" },
  { value: "GE", label: "Georgia" },
  { value: "GF", label: "French Guiana" },
  { value: "GG", label: "Guernsey" },
  { value: "GH", label: "Ghana" },
  { value: "GI", label: "Gibraltar" },
  { value: "GL", label: "Greenland" },
  { value: "GM", label: "Gambia" },
  { value: "GN", label: "Guinea" },
  { value: "GP", label: "Guadeloupe" },
  { value: "GQ", label: "Equatorial Guinea" },
  { value: "GR", label: "Greece" },
  { value: "GS", label: "South Georgia and the South Sandwich Islands" },
  { value: "GT", label: "Guatemala" },
  { value: "GU", label: "Guam" },
  { value: "GW", label: "Guinea-Bissau" },
  { value: "GY", label: "Guyana" },
  { value: "HK", label: "Hong Kong" },
  { value: "HM", label: "Heard Island and McDonald Islands" },
  { value: "HN", label: "Honduras" },
  { value: "HR", label: "Croatia" },
  { value: "HT", label: "Haiti" },
  { value: "HU", label: "Hungary" },
  { value: "ID", label: "Indonesia" },
  { value: "IE", label: "Ireland" },
  { value: "IL", label: "Israel" },
  { value: "IM", label: "Isle of Man" },
  { value: "IN", label: "India" },
  { value: "IO", label: "British Indian Ocean Territory" },
  { value: "IQ", label: "Iraq" },
  { value: "IR", label: "Iran" },
  { value: "IS", label: "Iceland" },
  { value: "IT", label: "Italy" },
  { value: "JE", label: "Jersey" },
  { value: "JM", label: "Jamaica" },
  { value: "JO", label: "Jordan" },
  { value: "JP", label: "Japan" },
  { value: "KE", label: "Kenya" },
  { value: "KG", label: "Kyrgyzstan" },
  { value: "KH", label: "Cambodia" },
  { value: "KI", label: "Kiribati" },
  { value: "KM", label: "Comoros" },
  { value: "KN", label: "Saint Kitts and Nevis" },
  { value: "KP", label: "Korea, Democratic People's Republic of" },
  { value: "KR", label: "Korea, Republic of" },
  { value: "KW", label: "Kuwait" },
  { value: "KY", label: "Cayman Islands" },
  { value: "KZ", label: "Kazakhstan" },
  { value: "LA", label: "Lao People's Democratic Republic" },
  { value: "LB", label: "Lebanon" },
  { value: "LC", label: "Saint Lucia" },
  { value: "LI", label: "Liechtenstein" },
  { value: "LK", label: "Sri Lanka" },
  { value: "LR", label: "Liberia" },
  { value: "LS", label: "Lesotho" },
  { value: "LT", label: "Lithuania" },
  { value: "LU", label: "Luxembourg" },
  { value: "LV", label: "Latvia" },
  { value: "LY", label: "Libya" },
  { value: "MA", label: "Morocco" },
  { value: "MC", label: "Monaco" },
  { value: "MD", label: "Moldova" },
  { value: "ME", label: "Montenegro" },
  { value: "MF", label: "Saint Martin (French part)" },
  { value: "MG", label: "Madagascar" },
  { value: "MH", label: "Marshall Islands" },
  { value: "MK", label: "North Macedonia" },
  { value: "ML", label: "Mali" },
  { value: "MM", label: "Myanmar" },
  { value: "MN", label: "Mongolia" },
  { value: "MO", label: "Macao" },
  { value: "MP", label: "Northern Mariana Islands" },
  { value: "MQ", label: "Martinique" },
  { value: "MR", label: "Mauritania" },
  { value: "MS", label: "Montserrat" },
  { value: "MT", label: "Malta" },
  { value: "MU", label: "Mauritius" },
  { value: "MV", label: "Maldives" },
  { value: "MW", label: "Malawi" },
  { value: "MX", label: "Mexico" },
  { value: "MY", label: "Malaysia" },
  { value: "MZ", label: "Mozambique" },
  { value: "NA", label: "Namibia" },
  { value: "NC", label: "New Caledonia" },
  { value: "NE", label: "Niger" },
  { value: "NF", label: "Norfolk Island" },
  { value: "NG", label: "Nigeria" },
  { value: "NI", label: "Nicaragua" },
  { value: "NL", label: "Netherlands" },
  { value: "NO", label: "Norway" },
  { value: "NP", label: "Nepal" },
  { value: "NR", label: "Nauru" },
  { value: "NU", label: "Niue" },
  { value: "NZ", label: "New Zealand" },
  { value: "OM", label: "Oman" },
  { value: "PA", label: "Panama" },
  { value: "PE", label: "Peru" },
  { value: "PF", label: "French Polynesia" },
  { value: "PG", label: "Papua New Guinea" },
  { value: "PH", label: "Philippines" },
  { value: "PK", label: "Pakistan" },
  { value: "PL", label: "Poland" },
  { value: "PM", label: "Saint Pierre and Miquelon" },
  { value: "PN", label: "Pitcairn" },
  { value: "PR", label: "Puerto Rico" },
  { value: "PS", label: "Palestine, State of" },
  { value: "PT", label: "Portugal" },
  { value: "PW", label: "Palau" },
  { value: "PY", label: "Paraguay" },
  { value: "QA", label: "Qatar" },
  { value: "RE", label: "Réunion" },
  { value: "RO", label: "Romania" },
  { value: "RS", label: "Serbia" },
  { value: "RU", label: "Russian Federation" },
  { value: "RW", label: "Rwanda" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "SB", label: "Solomon Islands" },
  { value: "SC", label: "Seychelles" },
  { value: "SD", label: "Sudan" },
  { value: "SE", label: "Sweden" },
  { value: "SG", label: "Singapore" },
  { value: "SH", label: "Saint Helena, Ascension and Tristan da Cunha" },
  { value: "SI", label: "Slovenia" },
  { value: "SJ", label: "Svalbard and Jan Mayen" },
  { value: "SK", label: "Slovakia" },
  { value: "SL", label: "Sierra Leone" },
  { value: "SM", label: "San Marino" },
  { value: "SN", label: "Senegal" },
  { value: "SO", label: "Somalia" },
  { value: "SR", label: "Suriname" },
  { value: "SS", label: "South Sudan" },
  { value: "ST", label: "Sao Tome and Principe" },
  { value: "SV", label: "El Salvador" },
  { value: "SX", label: "Sint Maarten (Dutch part)" },
  { value: "SY", label: "Syrian Arab Republic" },
  { value: "SZ", label: "Eswatini" },
  { value: "TC", label: "Turks and Caicos Islands" },
  { value: "TD", label: "Chad" },
  { value: "TF", label: "French Southern Territories" },
  { value: "TG", label: "Togo" },
  { value: "TH", label: "Thailand" },
  { value: "TJ", label: "Tajikistan" },
  { value: "TK", label: "Tokelau" },
  { value: "TL", label: "Timor-Leste" },
  { value: "TM", label: "Turkmenistan" },
  { value: "TN", label: "Tunisia" },
  { value: "TO", label: "Tonga" },
  { value: "TR", label: "Turkey" },
  { value: "TT", label: "Trinidad and Tobago" },
  { value: "TV", label: "Tuvalu" },
  { value: "TW", label: "Taiwan" },
  { value: "TZ", label: "Tanzania" },
  { value: "UA", label: "Ukraine" },
  { value: "UG", label: "Uganda" },
  { value: "UM", label: "United States Minor Outlying Islands" },
  { value: "US", label: "United States of America" },
  { value: "UY", label: "Uruguay" },
  { value: "UZ", label: "Uzbekistan" },
  { value: "VA", label: "Holy See" },
  { value: "VC", label: "Saint Vincent and the Grenadines" },
  { value: "VE", label: "Venezuela" },
  { value: "VG", label: "Virgin Islands (British)" },
  { value: "VI", label: "Virgin Islands (U.S.)" },
  { value: "VN", label: "Viet Nam" },
  { value: "VU", label: "Vanuatu" },
  { value: "WF", label: "Wallis and Futuna" },
  { value: "WS", label: "Samoa" },
  { value: "YE", label: "Yemen" },
  { value: "YT", label: "Mayotte" },
  { value: "ZA", label: "South Africa" },
  { value: "ZM", label: "Zambia" },
  { value: "ZW", label: "Zimbabwe" },
]

export function StepLocation({ data, onChange, errors }: StepLocationProps) {
  const [newSite, setNewSite] = useState<Omit<SiteLocation, "id">>({
    country: "",
    city: "",
    description: "",
  })

  const handleHeadquartersChange = (country: string) => {
    onChange({
      ...data,
      headquartersCountry: country,
    })
  }

  const addSiteLocation = () => {
    if (newSite.country && newSite.city) {
      const siteLocation: SiteLocation = {
        id: Date.now().toString(),
        ...newSite,
      }
      onChange({
        ...data,
        siteLocations: [...data.siteLocations, siteLocation],
      })
      setNewSite({ country: "", city: "", description: "" })
    }
  }

  const removeSiteLocation = (id: string) => {
    onChange({
      ...data,
      siteLocations: data.siteLocations.filter((site) => site.id !== id),
    })
  }

  const canAddSite = newSite.country && newSite.city

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">Company Locations</h2>
        <p className="text-[#4a4a4a]">Tell us where your company operates</p>
      </div>

      <div className="space-y-6">
        {/* Headquarters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-[#3270a1]" />
            <h3 className="text-lg font-semibold text-[#1a1a1a]">Headquarters</h3>
          </div>

          <SelectInput
            label="Headquarters Country"
            placeholder="Select your headquarters country"
            options={countries}
            value={data.headquartersCountry}
            onChange={(e) => handleHeadquartersChange(e.target.value)}
            error={errors?.headquartersCountry}
            required
            helperText="The country where your company is legally registered"
          />
        </div>

        {/* Site Locations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#3270a1]" />
              <h3 className="text-lg font-semibold text-[#1a1a1a]">Additional Site Locations</h3>
            </div>
            <span className="text-sm text-[#4a4a4a]">Optional</span>
          </div>

          <p className="text-sm text-[#4a4a4a] mb-4">
            Add any additional locations where your company has significant operations, offices, or facilities.
          </p>

          {/* Existing Site Locations */}
          {data.siteLocations.length > 0 && (
            <div className="space-y-3 mb-6">
              {data.siteLocations.map((site) => {
                const countryLabel = countries.find((c) => c.value === site.country)?.label || site.country
                return (
                  <div key={site.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-[#1a1a1a]">
                        {site.city}, {countryLabel}
                      </div>
                      {site.description && <div className="text-sm text-[#4a4a4a] mt-1">{site.description}</div>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSiteLocation(site.id)}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      aria-label={`Remove ${site.city}, ${countryLabel}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Add New Site Location */}
          <div className="border border-gray-200 rounded-lg p-6 space-y-4">
            <h4 className="font-medium text-[#1a1a1a] mb-4">Add Site Location</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectInput
                label="Country"
                placeholder="Select country"
                options={countries}
                value={newSite.country}
                onChange={(e) => setNewSite({ ...newSite, country: e.target.value })}
              />

              <FormTextInput
                label="City"
                placeholder="Enter city name"
                value={newSite.city}
                onChange={(e) => setNewSite({ ...newSite, city: e.target.value })}
              />
            </div>

            <FormTextInput
              label="Description"
              placeholder="e.g., Manufacturing facility, Regional office, Distribution center"
              value={newSite.description}
              onChange={(e) => setNewSite({ ...newSite, description: e.target.value })}
              helperText="Optional: Describe the type of operations at this location"
            />

            <button
              type="button"
              onClick={addSiteLocation}
              disabled={!canAddSite}
              className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                transition-all duration-200 ease-out
                ${
                  canAddSite
                    ? "bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white hover:shadow-lg hover:scale-105 active:scale-95"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }
              `}
            >
              <Plus className="w-4 h-4" />
              Add Location
            </button>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
          <div>
            <h4 className="font-medium text-green-900 mb-1">Location-Based ESG Insights</h4>
            <p className="text-sm text-green-800">
              By providing your locations, we can offer more accurate ESG reporting based on regional regulations,
              climate risks, and sustainability standards specific to each area.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
