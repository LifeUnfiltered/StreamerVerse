import { useState } from 'react';
import type { Video } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { User, Film, Building2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface CastAndCrewProps {
  video: Video;
}

interface Person {
  id: number;
  name: string;
  profile_path?: string | null;
  character?: string;
  job?: string;
  department?: string;
}

interface Company {
  id: number;
  name: string;
  logo_path?: string | null;
}

interface Network {
  id: number;
  name: string;
  logo_path?: string | null;
}

export default function CastAndCrew({ video }: CastAndCrewProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // Extract cast and crew from metadata
  const cast = video.metadata?.cast as Person[] || [];
  const crew = video.metadata?.crew as Person[] || [];
  const createdBy = video.metadata?.createdBy as Person[] || [];
  const productionCompanies = video.metadata?.productionCompanies as Company[] || [];
  const networks = video.metadata?.networks as Network[] || [];
  
  // Determine if this is a movie or TV show
  const isMovie = video.metadata?.type === 'movie';
  const isTvShow = video.metadata?.type === 'tv';
  
  // Group crew by department/job
  const directors = crew.filter(person => person.job === 'Director');
  const writers = crew.filter(person => 
    person.job === 'Writer' || 
    person.job === 'Screenplay' || 
    person.department === 'Writing'
  );
  const producers = crew.filter(person => 
    person.job === 'Producer' || 
    person.job === 'Executive Producer'
  );
  
  // For TV shows, merge creators with writers
  const allWriters = isTvShow ? [...writers, ...createdBy] : writers;
  
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  // Helper to generate Avatar with fallback
  const renderAvatar = (person: Person) => {
    return (
      <Avatar className="h-16 w-16 border-2 border-background">
        <AvatarImage 
          src={person.profile_path ? 
            `https://image.tmdb.org/t/p/w185${person.profile_path}` : 
            undefined} 
          alt={person.name} 
        />
        <AvatarFallback className="bg-muted text-primary">
          {person.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
    );
  };
  
  // Helper to generate Company logo with fallback
  const renderCompanyLogo = (company: Company | Network) => {
    return (
      <div className="flex flex-col items-center justify-center p-2">
        {company.logo_path ? (
          <img 
            src={`https://image.tmdb.org/t/p/w92${company.logo_path}`} 
            alt={company.name} 
            className="h-12 object-contain mb-2"
          />
        ) : (
          <Building2 className="h-12 w-12 text-muted-foreground" />
        )}
        <span className="text-xs text-center font-medium">{company.name}</span>
      </div>
    );
  };
  
  if (!cast.length && !crew.length && !productionCompanies.length) {
    return null; // No data to display
  }
  
  return (
    <div className="space-y-4 py-2">
      <h3 className="text-lg font-semibold">Cast & Crew</h3>
      
      <Tabs defaultValue="cast" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="cast" className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Cast</span>
          </TabsTrigger>
          <TabsTrigger value="crew" className="flex items-center gap-1">
            <Film className="h-4 w-4" />
            <span className="hidden sm:inline">Crew</span>
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center gap-1">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Companies</span>
          </TabsTrigger>
          {isTvShow && networks.length > 0 && (
            <TabsTrigger value="networks" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Networks</span>
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="cast" className="mt-4">
          {cast.length > 0 ? (
            <ScrollArea className="h-full max-h-[300px]">
              <div className="space-y-4">
                {/* Main Cast */}
                <div>
                  <Button 
                    variant="ghost" 
                    className="flex w-full justify-between p-2"
                    onClick={() => toggleSection('cast')}
                  >
                    <span className="font-medium">Cast</span>
                    <span>{expandedSection === 'cast' ? '−' : '+'}</span>
                  </Button>
                  
                  <div className={cn(
                    "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2",
                    expandedSection !== 'cast' && 'hidden'
                  )}>
                    {cast.map(person => (
                      <div key={person.id} className="flex flex-col items-center text-center">
                        {renderAvatar(person)}
                        <div className="mt-2">
                          <p className="font-medium text-sm">{person.name}</p>
                          {person.character && (
                            <p className="text-xs text-muted-foreground">{person.character}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground text-center py-4">No cast information available</p>
          )}
        </TabsContent>
        
        <TabsContent value="crew" className="mt-4">
          {crew.length > 0 || createdBy.length > 0 ? (
            <ScrollArea className="h-full max-h-[300px]">
              <div className="space-y-4">
                {/* Directors */}
                {directors.length > 0 && (
                  <div>
                    <Button 
                      variant="ghost" 
                      className="flex w-full justify-between p-2"
                      onClick={() => toggleSection('directors')}
                    >
                      <span className="font-medium">Directors</span>
                      <span>{expandedSection === 'directors' ? '−' : '+'}</span>
                    </Button>
                    
                    <div className={cn(
                      "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2",
                      expandedSection !== 'directors' && 'hidden'
                    )}>
                      {directors.map(person => (
                        <div key={person.id} className="flex flex-col items-center text-center">
                          {renderAvatar(person)}
                          <div className="mt-2">
                            <p className="font-medium text-sm">{person.name}</p>
                            <Badge variant="outline" className="mt-1">Director</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Writers/Creators */}
                {allWriters.length > 0 && (
                  <div>
                    <Button 
                      variant="ghost" 
                      className="flex w-full justify-between p-2"
                      onClick={() => toggleSection('writers')}
                    >
                      <span className="font-medium">{isTvShow ? 'Writers & Creators' : 'Writers'}</span>
                      <span>{expandedSection === 'writers' ? '−' : '+'}</span>
                    </Button>
                    
                    <div className={cn(
                      "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2",
                      expandedSection !== 'writers' && 'hidden'
                    )}>
                      {allWriters.map(person => (
                        <div key={person.id} className="flex flex-col items-center text-center">
                          {renderAvatar(person)}
                          <div className="mt-2">
                            <p className="font-medium text-sm">{person.name}</p>
                            <Badge variant="outline" className="mt-1">
                              {person.job || 'Creator'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Producers */}
                {producers.length > 0 && (
                  <div>
                    <Button 
                      variant="ghost" 
                      className="flex w-full justify-between p-2"
                      onClick={() => toggleSection('producers')}
                    >
                      <span className="font-medium">Producers</span>
                      <span>{expandedSection === 'producers' ? '−' : '+'}</span>
                    </Button>
                    
                    <div className={cn(
                      "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2",
                      expandedSection !== 'producers' && 'hidden'
                    )}>
                      {producers.map(person => (
                        <div key={person.id} className="flex flex-col items-center text-center">
                          {renderAvatar(person)}
                          <div className="mt-2">
                            <p className="font-medium text-sm">{person.name}</p>
                            <Badge variant="outline" className="mt-1">{person.job}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground text-center py-4">No crew information available</p>
          )}
        </TabsContent>
        
        <TabsContent value="companies" className="mt-4">
          {productionCompanies.length > 0 ? (
            <ScrollArea className="h-full max-h-[300px]">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {productionCompanies.map(company => (
                  <div key={company.id} className="flex flex-col items-center">
                    {renderCompanyLogo(company)}
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground text-center py-4">No production company information available</p>
          )}
        </TabsContent>
        
        {isTvShow && (
          <TabsContent value="networks" className="mt-4">
            {networks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {networks.map(network => (
                  <div key={network.id} className="flex flex-col items-center">
                    {renderCompanyLogo(network)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No network information available</p>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}