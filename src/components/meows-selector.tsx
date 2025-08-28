"use client";

import { useState, useRef, useEffect } from "react";
import { assignBye } from "@/ai/flows/assign-bye";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Cat,
  PlusCircle,
  XCircle,
  Swords,
  Loader2,
  Coffee,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Team = {
  id: number;
  name: string;
};

type Pairing = [string, string];

export default function MeowsSelector() {
  const [teams, setTeams] = useState<Team[]>([{ id: 1, name: "" }]);
  const [nextId, setNextId] = useState(2);
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [byeTeam, setByeTeam] = useState<string | null>(null);
  const [previousByeTeam, setPreviousByeTeam] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus the last input when a new team is added
    if (inputRefs.current.length > 0) {
      const lastInput = inputRefs.current[inputRefs.current.length - 1];
      if (lastInput) {
        lastInput.focus();
      }
    }
  }, [teams.length]);


  const handleAddTeam = () => {
    setTeams([...teams, { id: nextId, name: "" }]);
    setNextId(nextId + 1);
  };

  const handleRemoveTeam = (id: number) => {
    if (teams.length > 1) {
      setTeams(teams.filter((team) => team.id !== id));
    }
  };

  const handleTeamNameChange = (id: number, newName: string) => {
    setTeams(
      teams.map((team) => (team.id === id ? { ...team, name: newName } : team))
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTeam();
    }
  };


  const handleGeneratePairings = async () => {
    setIsLoading(true);
    setError(null);
    setPairings([]);
    setByeTeam(null);

    let currentTeams = teams
      .map((t) => t.name.trim())
      .filter((name) => name !== "");

    if (currentTeams.length < 2) {
      setError("Please enter at least two valid team names.");
      setIsLoading(false);
      return;
    }
    
    // Simple deduplication
    currentTeams = [...new Set(currentTeams)];
    if(currentTeams.length !== teams.filter(t => t.name.trim() !== "").length) {
      setError("Duplicate team names are not allowed. Please provide unique names.");
      setIsLoading(false);
      return;
    }


    try {
      if (currentTeams.length % 2 !== 0) {
        const byeResult = await assignBye({
          teams: currentTeams,
          previousByeTeam: previousByeTeam || undefined,
        });
        setByeTeam(byeResult.byeTeam);
        setPreviousByeTeam(byeResult.byeTeam);
        currentTeams = byeResult.updatedTeams;
      } else {
        setPreviousByeTeam(null);
      }

      // Fisher-Yates shuffle
      for (let i = currentTeams.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentTeams[i], currentTeams[j]] = [currentTeams[j], currentTeams[i]];
      }

      const newPairings: Pairing[] = [];
      for (let i = 0; i < currentTeams.length; i += 2) {
        if (currentTeams[i + 1]) {
          newPairings.push([currentTeams[i], currentTeams[i + 1]]);
        }
      }
      setPairings(newPairings);
    } catch (e) {
      console.error(e);
      setError("An AI error occurred while assigning a bye. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const validTeamsCount = teams.filter((t) => t.name.trim() !== "").length;

  return (
    <div className="space-y-8">
      <header className="text-center">
        <div className="flex justify-center items-center gap-4 mb-4">
            <Cat className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold font-headline bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Meow's Selector</h1>
        </div>
        <p className="font-subtext text-lg text-muted-foreground">
          Enter your teams and generate random pairings instantly.
        </p>
      </header>
      
      <div className="space-y-4">
      {teams.map((team, index) => (
        <Card key={team.id} className="glassmorphism overflow-hidden transition-all duration-300 ease-in-out">
            <div className="p-4 flex items-center gap-4">
              <Label htmlFor={`team-${team.id}`} className="font-subtext text-lg w-24">
                Team {index + 1}
              </Label>
              <Input
                id={`team-${team.id}`}
                ref={el => inputRefs.current[index] = el}
                type="text"
                placeholder={`Enter Team ${index + 1} Name`}
                value={team.name}
                onChange={(e) => handleTeamNameChange(team.id, e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-grow bg-transparent border-0 text-lg placeholder:font-subtext focus:ring-0"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveTeam(team.id)}
                disabled={teams.length <= 1}
                aria-label="Remove Team"
              >
                <XCircle className="h-6 w-6 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
        </Card>
      ))}
      </div>
          
      <div className="flex justify-center gap-4">
        <Button className="bg-gradient-to-r from-primary/80 to-accent/80 hover:from-primary hover:to-accent text-primary-foreground" variant="outline" onClick={handleAddTeam}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Another Team
        </Button>
        <Button
          size="lg"
          onClick={handleGeneratePairings}
          disabled={validTeamsCount < 2 || isLoading}
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Swords className="mr-2 h-5 w-5" />
          )}
          Generate Pairings
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-headline">Error</AlertTitle>
          <AlertDescription className="font-subtext">{error}</AlertDescription>
        </Alert>
      )}

      {(pairings.length > 0 || byeTeam) && (
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="font-headline text-center text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Generated Matchups</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            {byeTeam && (
              <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-accent p-4 bg-accent/10">
                <Coffee className="h-8 w-8 text-primary" />
                <p className="text-sm font-subtext text-muted-foreground">Bye Round</p>
                <p className="text-xl font-bold font-headline text-primary">{byeTeam}</p>
              </div>
            )}
            {pairings.length > 0 && (
              <ul className="space-y-4">
                {pairings.map((pair, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-center text-lg font-medium p-4 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10 shadow-lg gradient-border"
                  >
                    <span className="w-2/5 text-right truncate pr-4 font-subtext text-foreground">{pair[0]}</span>
                    <span className="text-primary font-bold font-headline">VS</span>
                    <span className="w-2/5 text-left truncate pl-4 font-subtext text-foreground">{pair[1]}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
